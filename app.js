"use strict";
global.rootPath = __dirname;
const Net = require('net');
const loadFiles = require(rootPath+'/api/loadFiles.js');
const clientManager = require(rootPath+'/api/clientManager.js');
const constantData = require(rootPath+'/api/constantData.js');
const mysql = require(rootPath+'/api/mysql.js');
const server = Net.createServer();
const clients = {};//保存客户端的连接
var client = null;//当前客户连接
var uid = 0;
//參數第一個小寫var testTest=null;

//方法第一個大寫function TestTest(){};

//使用npm 第一個大寫var Net = require('net');

//範例
// Promise
// new Promise( (resolve, reject) =>{ 
//     console.log('1');
//     reture resolve(1);
// }).then(a=>{
//     console.log('a');
//     Promise.resolve(a);
// }).then(a=>{
//     console.log('a');
//     throw new Error("rejected!");
// }).catch(error=>{
//     console.log(error);
// });

//唯讀
//Object.defineProperty(global,'path', { writable: false });

/*
client上傳的Data格式
{
    behavior:'服務:行為'  字串
    data:'{data}'   物件
}
*/


var p = mysql.Connect('threekingdoms', 'root', 'hp3def8g');
console.log('connectMySQL');
p.then((a)=>{
    //讀取所有api腳本並執行Init
    var p =[];
    var api =  loadFiles.LoadAllScript(__dirname+'/api');
    Object.keys(api).forEach(name=>{
        var init = api[name]['Init'];
        if(init!=null){
            p.push(init());
        }
    })
    console.log('loadapi');
    return Promise.resolve(Promise.all(p));
}).then(()=>{
    //讀取所有services腳本
    var a = loadFiles.LoadAllScript(__dirname+'/services');
    console.log('loadservices');
    return Promise.resolve(a);
}).then(methods=>{
    server.on('connection',(socket)=>{
        //啟動心跳機制
        clientManager.SocketHeartbeat(socket);
        console.log('connection');
        //收到訊息時
        socket.on('data',(clientData)=>{
            var data = JSON.parse(clientData);
            var methodName = data.services.split(":");
            var serviceName =methodName[0].toLowerCase().charAt(0) +methodName[0].substring(1);
            var method = methods[serviceName];
            Object.assign(data,JSON.parse(data.data));
            data['behaviors'] = methodName[1]||null;
            if(method!=null){
                console.log(socket.uid);
                if(Object.keys(clientManager.clients).includes(socket.uid)||constantData.ignoreServices.includes(methodName[0])){
                    method['Action'](socket,data);//每個行為都有Action
                }
                else{
                    console.log(data);
                }
                console.log(data);
            }
            else throw new Error("services is null!" + data.services);
        });
        //連線中斷時
        socket.on('end',()=>{
            console.log('client disconnected.');
        });
        socket.on('error',(error)=>{
            console.log(socket+' : '+error.message);
            socket.destroy();
        });
    });
    server.listen({port:1337});//启动监听  
    console.log('done');
}).catch(error=>{
    console.log(error);
});

server.on('error',(err)=>{
    console.log('Server is Error:'+err);
});
server.on('listening',()=>{
    console.log(`listening on ${server.address().address}:${server.address().port}${server.address().family}`);
});

/**
 * 打包傳送的資料
 * @param {Object} reqData 
 * @param {string} services 
 * @param {Object} data 
 * @param {string} error 
 */
global.PackageResponseData = (reqData,data,error)=>{
    var resData ={};
    resData.id =reqData.id;
    resData.services =reqData.services;
    resData.data = JSON.stringify(data);
    if(error!=null)resData.errorMessage=error;
    return JSON.stringify(resData);
}