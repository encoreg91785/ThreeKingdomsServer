"use strict";
const Entity = require("../tools/rpc").Entity;
module.exports = class Player extends Entity {
    /**
     * 腳色相關
     * @param {object} obj 
     * @param {number} obj.id 
     * @param {number} obj.aid 
     * @param {number} obj.exp
     * @param {number} obj.level
     * @param {number} obj.name 
     * @param {number} obj.isOnline 
     */
    constructor(obj) {
        super();
        obj = obj || {}
        /**
         * 唯一識別碼
         */
        this.id = obj.id || 0;
        /**
         * 帳號id
         */
        this.aid = obj.aid || 0;
        /**
         * 名稱
         */
        this.name = obj.name || "Test";
        /**
         * 等級
         */
        this.level = obj.level || 0;
        /**
         * 經驗值
         */
        this.exp = obj.exp || 0;
        /**
         * 玩家狀態 -1:下限 0:上線 1:閒置 2:房間內 3:遊戲中 
         */
        this.status = -1;
    };
}