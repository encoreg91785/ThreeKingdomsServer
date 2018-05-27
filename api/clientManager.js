"use strict";
const constantData = require(rootPath+'/api/constantData.js');
const clients = {};
const clientsData = {};
global.currentClient = null;

 /**
     * 建立呼吸機制
     * 每5秒檢查一次
     * socket.heartbeat = 呼吸機制
     * socket.uid = 唯一碼
     */
function SocketHeartbeat(socket){
    currentClient = socket;
    socket.isOnline = true;
    socket.heartbeat = setInterval(()=>{
        if(socket.isOnline==false){
            DisconnectSocket(socket,constantData.error.heartbeatUnresponded);
        }
        else{
            var data={};
            data.services = constantData.services.heartbeat;
            data.data="{}";
            socket.isOnline=false;
            socket.write(JSON.stringify(data));
        }
    },5000)
}

function Broadcast(users,data){
    users.forEach(userId => {
        clients[userId]&&clients[userId].write(data);
    });
}

function AddClient(socket,data){
    clients[socket.uid]=socket;
    clientsData[socket.uid]=data;
}

function DisconnectSocket(socket,message){
    socket.heartbeat&&clearInterval(socket.heartbeat); //將呼吸機制關閉
    if(socket.uid==null){
        console.log(socket+" not login yet"); 
        socket.destroy();
    }
    else{
        delete clients[socket.uid]; 
        socket.end(message);
    }
}
module.exports ={
    clients:clients,
    SocketHeartbeat:SocketHeartbeat,
    DisconnectSocket:DisconnectSocket,
    GetCurrentClient:function(){
        return currentClient;
    },
    AddClient:AddClient,
}