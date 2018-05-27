"use strict";
const Sequelize = require('sequelize');
const constantData = require(rootPath+'/api/constantData.js');
var sequelize= null;
var modules={};
// const sequelize = new Sequelize('threekingdoms', 'root', 'hp3def8g', {
//   host: 'localhost',
//   dialect: 'mysql',
// });
// sequelize.authenticate()
//   .then(() => {
//     //sequelize.query("create schema if not exists enableETS;");
//     console.log('Connection has been established successfully.');
//     process.on('exit', onExit.bind(null, { cleanup: true }));
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

function Connect(database,userName,password,option,autoCreate = false){
    return new Promise((resolve, reject) => {
        var defaultOption = { host: 'localhost',dialect: 'mysql'};
        option = option||defaultOption;
        sequelize = new Sequelize(database,userName,password,option);
        sequelize.authenticate().then(()=>{
            if(autoCreate ==true)sequelize.query("create schema if not exists "+database+";");
            console.log('Connection has been '+database+'successfully.');
        }).then(()=>{
            var p =loadTables(constantData.defineTables);
            resolve(p);
        });
    }).catch(err=>{
        console.error('Unable to connect to the database:', err);
    });
}    

function loadTables(tables,option){
    var p =[];
    option = option||{timestamps: false,freezeTableName: true};
    Object.keys(tables).forEach(tableName=>{
        console.log(tableName);
        modules[tableName]=sequelize.define(tableName,tables[tableName],option);
        p.push(modules[tableName].sync().then(()=>{console.log(tableName);}));
    })
    return Promise.all(p);
}


module.exports ={
    modules:modules,
    Connect:Connect,
}


//   module.exports.connect = function (database, userName, password, options) {
//     return new Promise((resolve, reject) => {
//         options = options || { };
//         options.dialect = options.dialect || 'mysql';
//         _sequelize = new Sequelize(database, userName, password, options);
//         _sequelize.dialect.supports.schemas = true;

//         _sequelize
//             .authenticate()
//             .then(function () {
//                 global.mySQL = this;
//                 //var redisClient = redis.createClient(options.redisPort||6379, options.redisIP||'localhost');
//                 //redisClients.instance = redisClient;
//                 console.log('Connection has been established successfully.');
//                 _sequelize.query("create schema if not exists enableETS;");
//                 process.on('exit', onExit.bind(null, { cleanup: true }));
//                 process.on('SIGINT', onExit.bind(null, { exit: true }));
//                 process.on('uncaughtException', onExit.bind(null, { exit: true }));
//                 return resolve();
//             })
//             .catch(function (err) {
//                 console.log('Unable to connect to the database:', err);
//                 return reject(err);
//             });
//     });
// };