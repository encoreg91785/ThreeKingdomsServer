'use strict';
const rpc = require("../tools/rpc");
const utility = require("../tools/utility");
const Room = require("../entity/room");
const gameSystem = require("../system/gameSystem");
const accountSystem = require("../system/accountSystem");
/**
 * @type {Object<number,Room>}
 */
const allRooms = {};

/**
 * 大廳現在人數
 * @type {number[]}
 */
const lobbyPlayerList = [];

/**
 * 房間流水編號
 */
let roomid = 0;

//#region RPC

/**
 * 創一個房間並加入
 * @param {string} name 
 */
function createRoom(name, password = "") {
    let sp = rpc.getCurrentStickPackage();
    roomid++;
    let r = new Room(roomid);
    r.roomName = name || "GameRoom" + r.id;
    r.host = sp.unique;
    r.password = password;
    r.playerIdList = [];
    r.readyIdList = [];
    r.playerIdList.push(sp.unique);
    leaveLobby();
    allRooms[roomid] = r;
    rpc.broadcastFire(lobbyPlayerList, "ProcessSystem", "AddRoom", r);
    return r;
}

/**
 * 準備遊戲
 * @param {number} roomId 
 */
function readyGame(roomId) {
    let r = findRoomById(roomId);
    let sp = rpc.getCurrentStickPackage();
    if (r != null && !r.readyIdList.includes(sp.unique)) {
        r.readyIdList.push(sp.unique);
        rpc.broadcastFire(r.playerIdList, "ProcessSystem", "UpdatePlayer", r.readyIdList);
        if (r.isPlay == false && r.readyIdList.length == r.playerIdList.length && r.readyIdList.length >= 2) {
            r.isPlay = true;
            //要處理
            gameSystem.inGame(r.id);
            rpc.broadcastFire(lobbyPlayerList, "ProcessSystem", "UpdateRoom", r);
            rpc.broadcastFire(r.playerIdList, "ProcessSystem", "StartGame");
        }
    }
}

/**
 * 取消準備
 * @param {number} roomId 
 */
function cancelReadyGame(roomId) {
    let r = findRoomById(roomId);
    let sp = rpc.getCurrentStickPackage();
    if (r != null && r.readyIdList.includes(sp.unique)) {
        utility.removeElement(r.readyIdList, sp.unique);
        rpc.broadcastFire(r.playerIdList, "ProcessSystem", "UpdatePlayer", r.readyIdList);
    }
}

/**
 * 房主開始遊戲
 * @param {number} roomId 
 */
function startGame(roomId) {
    let sp = rpc.getCurrentStickPackage()
    let r = getRoomById(roomId);
    if (r.isPlay == false && //沒在遊戲中
        r.readyIdList.length == r.playerIdList.length && //所有人都準備 
        r.readyIdList.length >= 2 && //人數大於2
        r.host == sp.unique) { //房主按開始的
        rpc.broadcastFire(r.playerIdList, "ProcessSystem", "StartGame");
    }
}

/**
 * 離開房間
 * @param {string} roomId 
 */
function leaveRoom(roomId, st) {
    let sp = st || rpc.getCurrentStickPackage();
    /**
     * @type {Room}
     */
    let r = getRoomById(roomId);
    if (r != null) {
        utility.removeElement(r.playerIdList, sp.unique);
        if (r.playerIdList.length == 0) {
            removeRoom(roomid);
            rpc.broadcastFire(lobbyPlayerList, "ProcessSystem", "RemoveRoom", r.id);
        }
        else {
            rpc.broadcastFire(lobbyPlayerList, "ProcessSystem", "UpdateRoom", r);
            rpc.broadcastFire(r.playerIdList, "ProcessSystem", "PlayerLeaveRoom", sp.unique);
        }
        joinLobby();
    }
    return r != null;
}

/**
 * 加入房間
 * @param {number} roomId 
 */
function joinRoom(roomId, password = "") {
    let sp = rpc.getCurrentStickPackage()
    let r = getRoomById(roomId);
    if (r != null && r.password == password) {
        let index = r.playerIdList.indexOf(sp.unique);
        if (!r.isPlay && index == -1 && r.playerIdList.length < r.max) {
            r.playerIdList.push(sp.unique);
            leaveLobby();
            rpc.broadcastFire(lobbyPlayerList, "ProcessSystem", "UpdateRoom", r);
            rpc.broadcastFire(r.playerIdList, "ProcessSystem", "PlayerJoinRoom", sp.unique);
            return r;
        }
        else return null;
    }
    else return null;
}

/**
 * 離開大廳
 */
function leaveLobby(id) {
    id = id || rpc.getCurrentStickPackage().unique
    utility.removeElement(lobbyPlayerList, id);
}

function joinLobby(id) {
    id = id || rpc.getCurrentStickPackage().unique;
    let index = lobbyPlayerList.indexOf(id)
    if (index == -1) {
        lobbyPlayerList.push(id);
    }
}

/**
 * 取得所有房間id
 */
function getRoomIdList() {
    const ids = Object.keys(allRooms);
    /**
     * @type {number[]}
     */
    const idss = [];
    ids.forEach(i => {
        const id = Number(i);
        idss.push(id);
    })
    return idss;
}

/**
 * 找尋房間
 * @param {number|number[]} ids
 * @returns {Room|Room[]}
 */
function getRoomById(ids) {

    if (typeof (ids) == "number") {
        const r = allRooms[ids];
        if (r == null) console.log(ids + " 此房間不存在");
        return r;
    }
    else if (ids instanceof (Array)) {
        const rs = [];
        for (let index = 0; index < ids.length; index++) {
            const id = ids[index];
            const r = allRooms[id];
            if (r != null) rs.push(r);
            else console.log(id + " 此房間不存在");
        }
        return rs;
    }
}
//#endregion

/**
 * 移除房間資料
 * @param {number} id 
 */
function removeRoom(id) {
    const r = allRooms[id];
    if (r != null) delete allRooms[id];
}

/**
 * 
 * @param {StickPackage} sp 
 */
function onDisconnect(sp) {
    //離開大廳
    leaveLobby(sp.unique);
    //離開房間
    for (let index = 0; index < allRooms.length; index++) {
        let r = allRooms[index];
        if (r.playerIdList.indexOf(sp.unique) != -1) {
            leaveRoom(r.id, sp);
            break;
        }
    }
}
module.exports.rpc = {
    joinRoom,
    leaveRoom,
    createRoom,
    joinLobby,
    leaveLobby,
    getRoomIdList,
    readyGame,
    cancelReadyGame,
    startGame
}
module.exports.onDisconnect = onDisconnect;
module.exports.getRoomById = getRoomById;

/**
 * @typedef {import("../tools/stickPackage")} StickPackage
 * @typedef {import("../entity/room")} Room
 */