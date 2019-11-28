"use strict";
const socketServer = require("./tools/socketServer");
const httpServer = require("./tools/httpServer");
const mysql = require('./tools/mysql');
const config = require('./config');

errorToJSON();
mysql.connect(config.db).then(()=>{
    return loadManager();
}).then(()=>{
    return socketServer.startServer(config.socket.port);
}).then(()=>{
    return httpServer.startServer(config.http.port);
}).then(()=>{
    console.log("Finish");
}).catch(e=>{
    console.log(e);
});

/**
 * 初始化所有Manager
 */
function loadManager() {
    const api = utility.loadAllScript("./manager");//初始化所有Manager 回傳 Promise
    let p = [];
    Object.keys(api).forEach(key => {
        if (api[key]['init'] != null) {
            p.push(api[key]['init']());
        }
    });
    return Promise.all(p);
}

/**
 * 讓Error訊息可以被轉成JSON
 */
function errorToJSON()
{
    if (!('toJSON' in Error.prototype))
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};
            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);
    
            return alt;
        },
        configurable: true,
        writable: true
    });
}
