"use strict";
const constantData = require(rootPath+'/api/constantData.js');
const clientManager = require(rootPath+'/api/clientManager.js');
const rooms={};

const Behaviors={
    CreateRoom:function(socket,reqData){
        var newRoom = NewRoom();
        newRoom.players.push(socket.uid);
        rooms[newRoom.id](newRoom);
        var resData =PackageResponseData(CombineServicesName(reqData.behavior),newRoom);
        socket.write(resData);
    },
    JoinRoom:function(socket,reqData){
        rooms[reqData.room.id].players.push(socket.uid);
        
    },
    LeaveRoom:function(socket,reqData){

    },
    ReflashRoom:function(socket,reqData){

    }
}

/**
 * 組合傳送資料的頭services+behaviors
 * @param {string} behavior 行為
 * @returns {string} lobby+behaviors(createroom/joinroom/leaveroom/reflashroom)
 */
function CombineServicesName(behavior){
    return constantData.services.lobby+':'+behavior;
}

// function PackageResPondData(behavior,data){
//     var reqData ={};
//     reqData.services = constantData.services.lobby+':'+behavior;
//     reqData.data.data = JSON.stringify(data);
//     return JSON.stringify(reqData);
// }

var roomId=0;
/**
 * @returns {room}
 */
function NewRoom(){
    roomId++;
    var room={};
    room[id] = roomId;
    room[name] = 'RoomName'+roomId;
    room[password] = null;
    room[maxPlayer] = 4;
    room[players] =[]; 
    return room;
}

function Action(socket,reqData){
    if(Behaviors[reqData.behaviors]!=null)Behaviors[reqData.behaviors](socket,reqData);
    else{
        clientManager.DisconnectSocket(socket,'"lobby reqFunction" Undefined');
        console.log("lobby Service Error"+reqData.behaviors);
    } 
}

module.exports ={
   Action:Action,
}

/**
 * 房間物件
 * @typedef {Object} room
 * @property {number} id 唯一碼
 * @property {String} name 房間名稱
 * @property {String} password 密碼
 * @property {String} maxPlayer 最大人數
 * @property {number[]} Players 玩家數
 */