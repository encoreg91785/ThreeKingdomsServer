"use strict";
const socketServer = require("./tools/socketServer");
const httpServer = require("./tools/httpServer");
const mysql = require('./tools/mysql');
const config = require('./config');

errorToJSON();
mysql.connect(config.db).then(_=>{
    return socketServer.startServer(config.socket.port);
}).then(_=>{
    return httpServer.startServer(config.http.port);
}).then(_=>{
    console.log("Finish");
}).catch(e=>{
    console.log(e);
});

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
