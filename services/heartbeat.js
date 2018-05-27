"use strict";

function Action(socket,reqdata){
    socket.isOnline = true;
}

module.exports ={
    Action:Action,
}