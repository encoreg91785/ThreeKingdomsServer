"use strict";
/**
 * 定義SocketEnum
 */
const socketType = {
    RpcRequest: 0,
    RpcResponse: 1,
    Sync: 2,
}

/**
 * 連線斷線錯誤
 */
const socketError = {
    repeatLogin: 0,
    noRespond: 1,
    dataError: 2,
}

/**
 * 回傳資料
 */
const resultCode={
    sueccse:"success",
    invalidParam:"invalidParam",
    invalidToken:"invalidToken",
}

/**
 * client端System-methods
 */
const clientSystem = {
    /**
     * 用戶管理
     */
    PlayerSystem: {
        name:"PlayerSystem",
        methods:{
        }   
    },
    /**
     * 房間管理
     */
    RoomSystem:{
        name:"RoomSystem",
        methods:{
            /**
             * 更新房間資訊
             */
            UpdateRoom:"UpdateRoom",
        }   
    }
}

module.exports.resultCode =resultCode;
module.exports.clientSystem = clientSystem;
module.exports.socketType = socketType;
module.exports.socketError = socketError;