"use strict";
const fs = require("fs");
const socketError = require('./constData').socketError;
const socketType = {
    RpcRequest: 0,
    RpcResponse: 1,
    Sync: 2,
    Notify: 3,
};
const StickPackage = require("./stickPackage");
const errorType = ["Object", "Function"]
/**
 * 當前的連線資料
 * @type {StickPackage}
 */
let currentStickPackage = null;
/**
 * @type {StickPackage}
 */
const allStickPackage = [];
let systems = {};
let unique = 0;//負數表示尚未登入
let syncTime = 60;
// /**
//  * 所有物件
//  * @type {Object<string,Entity[]>}
//  */
// const allEntity = {};
/**
 * 初始化
 */
function init() {
    systems = loadAllScript("./system");
    let pLs = [];
    Object.keys(systems).forEach(e => {
        if (systems[e]["init"] != null) {
            pLs.push(systems[e]["init"]());
        }
    })
    return Promise.all(pLs);
}

/**
 * 解析
 * @param {*} uid 唯一碼
 * @param {*} type 資料類型
 * @param {string} className 
 * @param {string} str
 * @param {StickPackage} stickPackage
 */
function socketPayloadDeserialize(uid, type, className, str, stickPackage) {
    currentStickPackage = stickPackage;
    console.log("=================接收================");
    console.log(uid, type, className, str);
    switch (type) {
        case socketType.RpcRequest://RpcRequest
            /**
             * @type {SocketPayload}
             */
            let payload = JSON.parse(str);
            let target = null;
            let returnObj = null;
            if (systems[className] != null && systems[className]['rpc'] != null && systems[className]['rpc'][payload.functionName] != null) {
                target = systems[className]['rpc'];
                //[payload.functionName].apply(systems[className], payload.arg);
            }
            // else if (allEntity[className] != null) {
            //     /**
            //      * @type {Entity[]}
            //      */
            //     let ls = allEntity[className];

            //     let entity = ls.find(e => e.entityId == payload.entityId);
            //     target = entity;
            //     //[payload.functionName].apply(entity,payload.arg);
            // }
            else console.log(className + "." + payload.functionName + " : 不存在")
            if (target != null) {
                returnObj = target[payload.functionName].apply(target, payload.arg);
                if (uid != 0) {
                    if (returnObj != null && returnObj.then != null) {
                        /**
                         * @type {Promise}
                         */
                        let p = returnObj;
                        p.then(r => {
                            let objType = jsTypeToCSharpType(r);
                            let data = StickPackage.setSendData(objType, r, socketType.RpcResponse, uid);
                            stickPackage.socket.write(data);
                        })
                    }
                    else {
                        let objType = jsTypeToCSharpType(returnObj);
                        let data = StickPackage.setSendData(objType, returnObj, socketType.RpcResponse, uid);
                        stickPackage.socket.write(data);
                    }
                }
            }
            break;
        case socketType.RpcResponse://RpcResponse
            /**
             * @type {Function}
             */
            let p = stickPackage.rpcCallBack[uid];
            if (p != null) {
                let data = JSON.parse(str)
                p(data);
            }
            break;
        case socketType.Sync:
            socketIsAlive(stickPackage);
            break;
        default:
            console.log(type + " : 沒定義的類型");
            break;
    }
}



/**
 * 包裝
 * @param {string} functionName 
 * @param {*[]} arg
 * @returns {SocketPayload} 方法資料 
 */
function socketPayloadSerialize(functionName, arg) {
    /**
     * @type {SocketPayload}
     */
    let pl = {};
    pl.functionName = functionName;
    pl.arg = arg;
    return pl;
}

function socketIsAlive(stickPackage) {
    stickPackage.isAlive = true;
}

/**
 * 廣播
 * @param {number[]} idList 要傳給的對象
 * @param {string} systemName 類別名
 * @param {string} methodName 方法名
 * @param  {...any} arg 參數
 */
function broadcastFire(idList, systemName, methodName, ...arg) {
    let payload = socketPayloadSerialize(methodName, arg);
    let data = StickPackage.setSendData(systemName, payload, socketType.RpcRequest);
    for (let index = 0; index < idList.length; index++) {
        let id = idList[index];
        let sq = findStickPackageByUnique(id);
        if (sq != null) {
            console.log(sq.unique, data);
            sq.socket.write(data);
        }
    }
}

/**
 * 同步資料
 * @param {StickPackage} stickPackage
 */
function socketSync(stickPackage) {
    unique--;
    stickPackage.unique = unique;
    addStickPackage(stickPackage);
    stickPackage.syncTimeout = setInterval(() => {
        if (stickPackage.isAlive == false) {
            stickPackage.close(socketError.noRespond, "Sync Stop");
        }
        else {
            stickPackage.isAlive = false;
            /**
            * @type {SyncData}
            */
            let d = { dt: new Date() };
            let sendData = StickPackage.setSendData("SyncData", d, socketType.Sync);
            stickPackage.socket.write(sendData);
        }
    }, 1000 * syncTime);
}

function loadAllScript(path) {
    let allFile = {};
    if (fs.existsSync(path)) {
        let files = fs.readdirSync(path);
        files.forEach(file => {
            let strs = file.split(".");
            if (strs.length == 2 && strs[1] == "js") {
                let filename = strs[0];
                allFile[filename] = require("../" + path + '/' + strs[0]);
            }
        });
        return allFile;
    }
    else return [];
}

/**
 * 執行client方法(有回傳)
 * @param {StickPackage} stickPackage 
 * @param {string} systemName 
 * @param {string} methodName 
 * @param  {...any} arg 
 */
function firePromise(systemName, methodName, ...arg) {
    currentStickPackage.uuid++;
    let p = new Promise((resolve, reject) => {
        currentStickPackage.rpcCallBack[currentStickPackage.uuid] = resolve;
        let payload = socketPayloadSerialize(null, methodName, arg);
        let data = currentStickPackage.setSendData(systemName, payload, socketType.RpcRequest, stickPackage.uuid);
        currentStickPackage.socket.write(data);
    });
    return p;
}
/**
 * 執行client方法
 * @param {StickPackage} stickPackage 
 * @param {string} systemName 
 * @param {string} methodName 
 * @param  {...any} arg 方法參數
 */
function fire(systemName, methodName, ...arg) {
    let payload = socketPayloadSerialize(null, methodName, arg);
    let data = currentStickPackage.setSendData(systemName, payload, socketType.RpcRequest, currentStickPackage.uuid);
    currentStickPackage.socket.write(data);
}

// /**
//  * 
//  * @param {StickPackage} stickPackage 
//  * @param {number} entityId 
//  * @param {string} className 
//  * @param {str} methodName 
//  * @param  {...any} arg 
//  */
// function fireEntityPromise(stickPackage, entityId, className, methodName, ...arg) {
//     stickPackage.uuid++;
//     let p = new Promise((resolve, reject) => {
//         stickPackage.rpcCallBack[stickPackage.uuid] = resolve;
//         let payload = socketPayloadSerialize(entityId, methodName, arg);
//         let data = StickPackage.setSendData(className, payload, socketType.RpcRequest, stickPackage.uuid);
//         stickPackage.socket.write(data);
//     });
//     return p;

// }

// /**
//  * 
//  * @param {StickPackage} stickPackage 
//  * @param {number} entityId 
//  * @param {string} className 
//  * @param {str} methodName 
//  * @param  {...any} arg 
//  */
// function fireEntity(stickPackage, entityId, className, methodName, ...arg) {
//     stickPackage.uuid++;
//     let payload = socketPayloadSerialize(entityId, methodName, arg);
//     let data = StickPackage.setSendData(className, payload, socketType.RpcRequest, stickPackage.uuid);
//     stickPackage.socket.write(data);
// }

/**
 * 
 * @param {number} unique 
 * @returns {StickPackage}
 */
function findStickPackageByUnique(unique) {
    let st = allStickPackage.find(e => e.unique == unique);
    return st;
}

/**
 * 
 * @param {StickPackage} stickPackage 
 * @returns {void}
 */
function addStickPackage(stickPackage) {
    allStickPackage.push(stickPackage);
}

/**
 * 
 * @param {StickPackage|number} stickOrId 
 */
function removeStickPackage(stickOrId) {
    let st = null;
    if (typeof (stickOrId) == "number") {
        st = findStickPackageByUnique(stickOrId)
    }
    else if (stickOrId.constructor.name == "StickPackage") {
        st = stickOrId;
    }
    if (st != null) {
        let index = allStickPackage.indexOf(st);
        if (index != -1) allStickPackage.splice(index, 1);
    }
}

/**
 * 通知
 * @param {string} className class名稱
 * @param {*} obj 資料物件
 * @param {number[]} target 通知的對象假如沒有就是當前的socket 
 */
function broadcastNotify(className, obj, target) {
    let buf = StickPackage.setSendData(className, obj, socketType.Notify);
    if (target.constructor.name == "Array") {
        for (let i = 0; i < target.length; i++) {
            let id = target[i];
            let sp = findStickPackageByUnique(id);
            if (sp != null) sp.socket.write(buf);
        }
    }
    else if (target == null) {
        currentStickPackage.socket.write(buf);
    }
    else console.log("target 型態錯誤");
}

function getCurrentStickPackage() {
    return currentStickPackage;
}

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onDisconnect(sp) {
    clearInterval(sp.syncTimeout);
    let ls = Object.values(systems);
    for (let i = 0; i < ls.length; i++) {
        let system = ls[i];
        if (system != null && system["onDisconnect"]) {
            system["onDisconnect"](sp);
        }
    }
    removeStickPackage(sp);
}

/**
 * 重連
 * @param {StickPackage} sp 
 */
function onReonnect(sp) {
    let ls = Object.values(systems);
    for (let i = 0; i < ls.length; i++) {
        let system = ls[i];
        if (system != null && system["onReonnect"]) {
            system["onReonnect"](sp);
        }
    }
}
// /**
//  * 
//  * @param {Entity} entity 
//  */
// function addEntity(entity) {
//     var ls = allEntity[entity.constructor.name];
//     if (ls != null && ls.length > 0) {
//         let en = ls.find(e => entity.entityId == e.entityId);
//     }
// }

// function removeEntity(entity) {
//     var ls = allEntity[entity.constructor.name];
//     if (ls != null && ls.length > 0) {
//         let en = ls.find(e => entity.entityId == e.entityId);
//         let index = allEntity.indexOf(en);
//         if (index != -1) allEntity.splice(index, 1);

//     }

// }

/**
 * 將物件轉成C#類別
 * @param {*} obj 
 */
function jsTypeToCSharpType(obj) {
    let type = "System.Object"
    let className = obj ? obj.constructor.name : null;
    if (className == "Boolean") {
        return type = "System.Boolean";
    }
    else if (className == "String") {
        return type = "System.String";
    }
    else if (className == "Number") {
        if (obj % 1 == 0) type = "System.Int32";
        else type = "System.Single";
    }
    else if (className == "Date") {
        return type = "System.DateTime";
    }
    else if (errorType.includes(className)) {
        console.log(obj, "類別無法判斷client會無法解析")
    }
    else if (className == "Array") {
        if (obj.length > 0) {
            type = jsTypeToCSharpType(obj[0]);
            type = type + "[]";
        }
        else type = type + "[]";
    }
    else type = className;
    return type;
}

function getCurrentStickPackage() {
    return currentStickPackage;
}

/**
 * @typedef {Object} SyncData
 * @property {string} dt
 * @property {number} ping
 */

class SocketPayload {
    /**
     * 
     * @param {string} functionName 
     * @param {number} entityId 
     * @param {any[]} arg 
     */
    constructor(functionName, entityId, arg) {
        this.functionName = functionName;
        this.entityId = entityId;
        this.arg = arg;
    }
}

/**暫時保留可以刪去 */
class Entity {
    constructor() {
    }
}

module.exports.firePromise = firePromise;
module.exports.fire = fire;
module.exports.Entity = Entity;
module.exports.socketPayloadDeserialize = socketPayloadDeserialize;
module.exports.socketSync = socketSync;
module.exports.init = init;
module.exports.removeStickPackage = removeStickPackage;
module.exports.findStickPackageByUnique = findStickPackageByUnique;
module.exports.getCurrentStickPackage = getCurrentStickPackage;
module.exports.broadcastFire = broadcastFire;
module.exports.broadcastNotify = broadcastNotify;
module.exports.onDisconnect = onDisconnect;
module.exports.onReonnect = onReonnect;

/**
 * @typedef {import("./stickPackage")} StickPackage
 */
/**
 * @typedef {import("net").Socket} Socket
 */

/**
 * @typedef ErrorMessage
 * @property {number} type
 * @property {string} msg
 */