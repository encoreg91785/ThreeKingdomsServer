'use strict';
const roomSystem = require('./roomSystem');
const accountSystem = require('./accountSystem');
const rpc = require('../tools/rpc');

/**
 * 所有聊天訊息紀錄
 * @type {Object<string,{Object<Date,string>}>}
 */
const messageList = {}
/**
 * 聊天訊息管理
 */
function init() {

}

//#region RPC

/**
 * 全頻訊息
 * @param {string} msg 
 */
function publicMessage(msg) {
    const ids = accountSystem.getAllOnlinePlayerId();
    rpc.broadcastFire(ids, "chatSystem", "publicMessage", msg, new Date());
}

/**
 * 大廳訊息
 * @param {string} msg 
 */
function lobbyMessage(msg) {
    const ids = roomSystem.lobbyPlayerList();
    rpc.broadcastFire(ids, "chatSystem", "lobbyMessage", msg, new Date());
}

/**
 * 私語
 * @param {string} msg 
 * @param {number} targetId 
 */
function privateMessage(msg, targetId) {
    rpc.broadcastFire([targetId], "chatSystem", "privateMessage", msg, new Date());
    return msg;
}

/**
 * 房間訊息
 * @param {string} msg 
 * @param {number} roomId 
 */
function roomMessage(msg, roomId) {
    /**
     * @type {Room}
     */
    const r = roomSystem.getRoomById(roomId);
    const sp = rpc.getCurrentStickPackage();
    if (r.playerIdList.includes(sp.unique)) {
        rpc.broadcastFire(r.playerIdList, "chatSystem", "roomMessage", msg,new Date());
    }
}

//#endregion

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onDisconnect(sp) {

}

/**
 * 重連
 * @param {StickPackage} sp 
 */
function onReonnect(sp) {

}

module.exports.rpc = {
    publicMessage,
    lobbyMessage,
    privateMessage,
    roomMessage
};
module.exports.init = init;
module.exports.onDisconnect = onDisconnect;
module.exports.onReonnect = onReonnect;


/**
 * @typedef {import("../tools/stickPackage")} StickPackage
 */

/**
* @typedef {import("../entity").Room} Room
*/