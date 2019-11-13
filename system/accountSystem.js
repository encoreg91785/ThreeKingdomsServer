'use strict';
/**
 * 所有用戶/玩家管理
 */
const mysql = require("../tools/mysql");
const rpc = require("../tools/rpc");
const Player = require("../entity").Player;
const roomSystem = require("../system/roomSystem");
const socketError = require('../tools/constData').socketError;
const axios = require('axios').default;
const url = require('../config').user_center_url;

/**
 * 所有玩家
 * @type {Object<number,Player>}
 */
const allPlayer = {};

/**
 * 斷線中...
 * 時間到將被移除
 * @type {Object<number,Player>}
 */
const disconnectPlayer = {};

//#region RPC 

/**
 * @param {string} account 
 * @param {string} password 
 */
function login(account, password) {
    let sp = rpc.getCurrentStickPackage();
    const data = new FormData();
    data.append('account', account);
    data.append('password', password);
    axios.post(url + "login", data).then(r => {
        if (r.data.result == "sueccse") {
            return mysql.modules["player"].findOne({ where: { aid: r.id } });
        }
        else {
            return null;
        }
    }).then(r => {
        if (r == null) return null;
        let st = rpc.findStickPackageByUnique(r.aid);
        if (st != null && sp != st) {
            st.close(socketError.repeatLogin, "重複登入");
        }
        if(disconnectPlayer[r.aid]!=null){
            delete disconnectPlayer[r.aid];
            sp.reConnectFunction(sp);
        }
        sp.unique = r.aid;
        const p = new Player(r);
        p.status = 0;
        allPlayer[r.aid] = p;
        roomSystem.joinLobby(sp.unique);
        return p;
    });
}

/**
 * 用戶註冊
 * @param {Object} accountData
 * @param {number} accountData.sex
 * @param {string} accountData.account
 * @param {string} accountData.password
 * @param {string} accountData.birthday
 * @param {string} accountData.phone
 * @param {string} accountData.email
 * @param {string} accountData.role
 * @param {string} accountData.name
 */
function register(accountData) {
    const data = new FormData();
    for (let key in accountData) {
        data.append(key, accountData[key]);
    }
    axios.post(url + "register", data).then(r => {
        /**
         * @type {string}
         */
        const result = r.data.result;
        if (result == "success") {
            return mysql.modules["account"].create({ name: accountData.name, photo: "0" }).then(_ => {
                return result;
            });
        }
        else return result;
    }).catch(err => {
        console.log("註冊嚴重錯誤", err);
        return "註冊嚴重錯誤:" + err;
    });
}

/**
 * 找尋玩家資料
 * @param {number} id 
 * @returns {Promise<Player>}
 */
function findPlayerById(id) {
    let p = allPlayer[id];
    //檢查在線玩家
    if (p == null) {
        p = disconnectPlayer[id];
        //檢查斷線玩家
        if (p == null) {
            //都沒有在找資料庫
            return mysql.modules["player"].findOne({ where: { aid: id } }).then(r => {
                const p = new Player(r);
                return p;
            });
        }
        return Promise.resolve(p);
    }
    else return Promise.resolve(p);
}

//#endregion

/**
 * 移除玩家
 * @param {number|Player} nOrP 
 */
function removePlayer(nOrP) {
    if (nOrP.constructor.name == "Player") {
        const p = allPlayer[nOrP.aid];
        if (p != null) delete allPlayer[nOrP.aid];
    }
    else if (typeof (nOrP) == "number") {
        const p = allPlayer[nOrP];
        if (p != null) delete allPlayer[nOrP];
    }
}

/**
 * 取的所有在線玩家id
 */
function getAllOnlinePlayerId(){
    const ids = Object.keys(allPlayer);
    /**
     * @type {number[]}
     */
    const idss = [];
    ids.forEach(i=>{
        const id = Number(i);
        idss.push(id);
    })
    return idss;
}

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onDisconnect(sp) {
    disconnectPlayer[sp.unique] = allPlayer[sp.unique];
    removePlayer(sp.unique);
}

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onReonnect(sp) {
}

module.exports.rpc = {
    login,
    register,
    findPlayerById
}

module.exports.getAllOnlinePlayerId = getAllOnlinePlayerId;
module.exports.onDisconnect = onDisconnect;
module.exports.onReonnect = onReonnect;
module.exports.findPlayerById = findPlayerById;
/**
 * @typedef {import("../tools/stickPackage")} StickPackage
 */