"use strict";
const Entity = require("../tools/rpc").Entity;
module.exports = class Room extends Entity {
    constructor(id) {
        super();
        this.id = id || 0;
        this.host = 0;
        this.password = "";
        this.roomName = "";
        this.playerIdList = [0];
        this.readyIdList = [0];
        this.max = 4;
        this.isPlay = false;
    };
}