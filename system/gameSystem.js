'use strict';
/**
 * 遊戲邏輯
 */
const utility = require("../tools/utility");
const rpc = require("../tools/rpc");
const roomSystem = require("../system/roomSystem");
function init() {
    
}

//#region RPC
//#endregion

/**
 * 斷線
 * @param {StickPackage} sp 
 */
function onDisconnect(sp){

}

/**
 * 重連
 * @param {StickPackage} sp 
 */
function onReonnect(sp) {

}

module.exports.rpc = {

};
module.exports.init = init;
module.exports.onDisconnect = onDisconnect;
module.exports.onReonnect = onReonnect;

/**
 * @typedef {import("../tools/stickPackage")} StickPackage
 */