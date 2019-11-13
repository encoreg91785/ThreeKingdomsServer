'use strict';
const utility = require("../tools/utility");
const rpc = require("../tools/rpc");
/**
 * 玩家誰的資料
 * @type {Object<number,Object<string,number[]>>}
 */
const playerObserve = {};

//#region RPC

/**
 * 客戶端開始監聽
 * @param {string} className 
 * @param {number[]} ids 
 */
function addListen(className, ids) {
    const sp = rpc.getCurrentStickPackage();
    const obList = playerObserve[sp] || {};
    const ls = obList[className] || [];
    const combine = ls.concat(ids);
    for (var i = 0; i < combine.length; ++i) {
        for (var j = i + 1; j < combine.length; ++j) {
            if (combine[i] === combine[j])
                combine.splice(j--, 1);
        }
    }
    obList[className] = combine;
    playerObserve[sp] = obList[className];
}

/**
 * 客戶端移除監聽
 * @param {string} className 
 * @param {number[]} ids 
 */
function removeListen(className, ids) {
    const sp = rpc.getCurrentStickPackage();
    const obList = playerObserve[sp] || {};
    const ls = obList[className] || [];
    for (var i = 0; i < ids.length; ++i) {
        utility.removeElement(ls, ids[i]);
    }
    obList[className] = combine;
    playerObserve[sp] = obList[className];
}

//#endregion

/**
 * 資料更動通知給監聽中的用戶
 * @param {number} belong  擁有者
 * @param {*} obj 資料
 * @param {string} className 類別名稱
 */
function notify(belong, obj, className = null) {
    /**
     * @type {number[]}
     */
    const spList = [];
    if (className == null) className = obj.constructor.name;
    Object.keys(playerObserve).forEach(key => {
        const id = Number(key)
        const ob = playerObserve[id];
        if (ob != null) {
            const ls = ob[className];
            if (ls != null && ls.length > 0) {
                if (ls.includes(belong)) {
                    spList.push(id)
                }
            }
        }
    })
    if (spList.length > 0) rpc.broadcastNotify(className, obj, spList);
}

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onDisconnect(sp) {
    const obList = playerObserve[sp.unique];
    if (obList != null) delete playerObserve[sp.unique];
}

module.exports.rpc = {
    addListen,
    removeListen
}
module.exports.notify = notify;
module.exports.onDisconnect = onDisconnect;
/**
 * @typedef {import("../tools/stickPackage")} StickPackage
 */