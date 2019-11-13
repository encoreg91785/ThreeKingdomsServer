"use strict";
const utility = require('./utility');
const constData = require('../tools/constData')
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const multipart = multer().any();
const app = express();
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

/**
 * 初始化所有Manager
 */
function loadManager() {
    const api = utility.loadAllScript("./manager");//初始化所有Manager 回傳 Promise
    let p = [];
    Object.keys(api).forEach(key => {
        if (api[key]['init'] != null) {
            p.push(api[key]['init']());
        }
    });
    return Promise.all(p);
}

/**
 * 讀取所有Router
 */
function loadRouter() {
    const method = utility.loadAllScript("./router");//讀取所有Router
    Object.keys(method).forEach(key => {
        if (method[key]['router'] != null) app.use('/' + key, method[key]['router']);
    });
}

/**
 * 開始啟動服務
 * 1.啟動檢驗IP是否更動
 * 2.資料解析
 * 3.讀取所有Router
 */
function startServer(port) {
    var p = new Promise((resolve, resject) => {
        app.use(parseMultipart);
        app.use(bodyParser.json({ limit: '50mb' }));//json
        app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));//x-www-form-urlencoded
        app.use(verify);
        //app.use(express.static('page'));
        loadRouter();
        app.listen(port, '0.0.0.0', () => {
            console.log('HttpServer Is Run');
            resolve();
        });
    });
    return loadManager().then(_ => {
        return p;
    });

}

/**
 * multipart/form-data
 * 上傳資料 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
function parseMultipart(req, res, next) {
    multipart(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.json({ result: constData.resultCode.invalidParam }); // A Multer error occurred when uploading.
        }
        else if (err) {
            // An unknown error occurred when uploading.
            res.json({ result: constData.resultCode.invalidParam });
        }
        else next();
    })
}

/**
 * 檢查是否合法
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
function verify(req, res, next) {
    let str = "(" + new Date().toLocaleString() + ") " + req.method + " " + req.path + " " + req.hostname;
    console.log(str);
    const token = req.headers.token;
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            res.json({ result: constData.resultCode.invalidToken })
        }
        else {
            req.params['decoded'] = decoded;
            next();
        }
    });
}

module.exports.startServer = startServer;


