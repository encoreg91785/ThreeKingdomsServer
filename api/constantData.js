"use strict";
const Sequelize = require('sequelize');

//判斷哪個行為
var services={
    heartbeat:'Heartbeat',
    investigate:'Investigate',
    lobby:'Lobby',
}

var ignoreServices=['Heartbeat','Investigate'];

//錯誤訊息
var error={
    heartbeatUnresponded:'heartbeatUnresponded',//呼吸機制沒回應
    repeatLogin:'repeatLogin',//重複登入
    accountNotExist:'accountNotExist',//帳號不存在
    accountHaveExisted:'accountHaveExisted',//帳號已經存在
}

//MySQL表單定義
var defineTables={

    account:{
        uid:{type:Sequelize.INTEGER,primaryKey: true,autoIncrement: true,},
        account:{type:Sequelize.STRING(30),allowNull: false,unique: true},
        password:{type:Sequelize.STRING(30),allowNull: false},
        name:{type:Sequelize.STRING(20),allowNull: false},
        level:{type:Sequelize.INTEGER},
        exp:{type:Sequelize.INTEGER},
    },
}

module.exports ={
    error:error,
    services:services,//行為
    defineTables:defineTables,//MySQL表格定義
    ignoreServices:ignoreServices,
}
