'use strict';
/**
 * 聊天訊息管理
 */
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