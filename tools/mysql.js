const Sequelize = require('sequelize');
const defineTables = require('./defineTables');
/**
 * 連線實體
 * @type {Sequelize.Sequelize}
 */
let sequelize = null;
/**
 * 資料庫物件
 * @type {Object.<string,typeof Sequelize.Model>
 */
let modules = {};

function connect(db) {
    const defaultOption = { host: 'localhost', dialect: 'mysql' };
    let option = db.option || defaultOption;
    return testConnect(db.schema, db.account, db.password, option).then(() => {
        sequelize = new Sequelize(db.schema, db.account, db.password, option);
        let p = loadTables(defineTables);//讀取資料表格
        return p;
    }).catch(err => {
        console.error('Unable to connect to the database');
        return Promise.reject(err);
    });
}

/**
 * 測試連線
 * @param {string} database schema名稱
 * @param {string} userName 帳號
 * @param {string} password 密碼
 * @param {Object} option 相關設定
 */
function testConnect(database, userName, password, option) {
    let testConnect = new Sequelize(null, userName, password, option);
    return testConnect.query("create schema if not exists " + database + ";").then(_ => {
        testConnect.close();
        console.log('Connection has been ' + database + ' successfully.');
    });

}

/**
 * 導入MySQL表單與格式
 * @param {Object} tables { table:Object option:Object }
 */
function loadTables(tables) {
    let p = [];
    if (tables == null) console.log("請定義defineTables.js");
    else {
        Object.keys(tables).forEach(tableName => {
            let option = tables[tableName].option || { timestamps: false, freezeTableName: true };
            modules[tableName] = sequelize.define(tableName, tables[tableName].table, option);
            p.push(modules[tableName].sync());
        })
    }
    return Promise.all(p);
}

function query(command) {
    return sequelize.query(command, { type: Sequelize.QueryTypes.SELECT });
}

module.exports.query = query;
module.exports.op = Sequelize.Op;
module.exports.modules = modules;
module.exports.connect = connect;