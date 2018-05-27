"use strict";
const mysql = require(rootPath+'/api/mysql.js');
const constantData = require(rootPath+'/api/constantData.js');
const clientManager = require(rootPath+'/api/clientManager.js');

const Behaviors={

    Login:function(socket,reqData){
        var error = null;
        mysql.modules.account.findOne({
            account:reqData.account,
            password:reqData.password
            //回傳特定內容
        }).then(acc=>{
            if(acc==null){
                error = constantData.accountNotExist;
            }
            else{
                //重登入時會踢掉
                if(clientManager.clients[acc.uid]!=null){
                    clientManager.DisconnectSocket(clientManager.clients[acc.uid],constantData.error.repeatLogin);
                }
                socket.uid = acc.uid;
                clientManager.AddClient(socket,acc);
                var resData = global.PackageResponseData(reqData,acc,error);
                socket.write(resData); 
            }
        });
    },

    Register:function(socket,reqData){
        mysql.modules.account.findOrCreate({
            where:{account:reqData.account},
            defaults:{
                account:reqData.account,
                password:reqData.password,
                name:reqData.name,
                exp:1,
                level:1,
            }
        }).then(result=>{
            var error = null;
            var data =null;
            if(result[1]==false){
                error = constantData.error.accountHaveExisted;
            }
            else{
                data = result[0];
            }
            var resData = global.PackageResponseData(reqData,data,error);
            socket.write(resData);
        })
    },
}

function Action(socket,reqData){
    if(Behaviors[reqData.behaviors]!=null)Behaviors[reqData.behaviors](socket,reqData);
    else{
        clientManager.DisconnectSocket(socket,'"investigate reqFunction" Undefined');
        console.log("investigate Service Error"+reqData.behaviors);
    } 
}
module.exports ={
    Action:Action,
}