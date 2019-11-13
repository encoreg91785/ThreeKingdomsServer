"use strict";
const net = require('net');
const StickPackage = require("./stickPackage");
const rpc = require("./rpc");
/**
 * @type {net.Server}
 */
let server;

function test(port) {
    var p = new Promise((resolve, reject) => {
        server = net.createServer();
        server.on('connection', (socket) => {
            let stickPackage = new StickPackage();
            stickPackage.onCompleteCallBack = rpc.socketPayloadDeserialize;
            stickPackage.socket = socket;
            rpc.socketSync(stickPackage);
            console.log("connection");
            /**
             * 拚黏封包物件
             */
            socket.on('data', (buf)=>{
                stickPackage.stick(buf);
            });
            //連線中斷時
            socket.on('end', () => {
                console.log("end");
                rpc.onDisconnect(stickPackage);
            });

            socket.on("close", (isError) => {
                console.log("close");
                
            });

            socket.on('error', (e) => {
                console.log(e);
            });
        });
        server.listen({ port:port }, () => {
            console.log("Socket Server Run");
            resolve();
        });//启动监听  
    });
}

function startServer(port) {
    var p = new Promise((resolve, reject) => {
        server = net.createServer();
        server.on('connection', (socket) => {
            let stickPackage = new StickPackage();
            stickPackage.onCompleteCallBack = rpc.socketPayloadDeserialize;
            stickPackage.socket = socket;
            rpc.socketSync(stickPackage);
            console.log("connection");
            /**
             * 拚黏封包物件
             */
            socket.on('data', (buf)=>{
                stickPackage.stick(buf);
            });
            //連線中斷時
            socket.on('end', () => {
                console.log("end");
                rpc.onDisconnect(stickPackage);
            });

            socket.on("close", (isError) => {
                console.log("close");
                
            });

            socket.on('error', (e) => {
                console.log(e);
            });
        });
        server.listen({ port:port }, () => {
            console.log("Socket Server Run");
            resolve();
        });//启动监听  
    });
    return rpc.init().then(_ => {
        return p;
    });
}

module.exports.startServer = startServer;