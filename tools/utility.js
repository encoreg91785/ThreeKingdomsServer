"use strict";
const fs = require('fs');
/**
 * 讀取路徑下所有js
 * 將方法裝成Object回傳
 * @param {string} path
 * @return {{string:function}}
 */
function loadAllScript(path) {
    var methods = {};
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        files.forEach(file => {
            var sp = file.split(".");
            //判斷是否不是是js並且
            if (sp.length >= 2 && sp[1] == 'js') {
                var filename = sp[0];
                methods[filename] = require("./" + path + '/' + file);
            }
        })
        return methods;
    }
    else return {};
}
/**
 * 判斷字串是否為Null 或是 空字串
 * @param {string} str 
 */
function isEmptyOrNull(str) {
    return str == null || str == "";
}

/**
 * 移除陣列中的元件
 * @param {*[]} array 
 * @param {*} element 
 */
function removeElement(array, element) {
    let index = array.indexOf(element);
    if (index != -1) array.splice(index, 1);
    return index != -1;
}

/**
 * 取得亂數(小於等於0回傳0)
 * @param {number} x 最大數(不包含最大數)
 */
function getRandom(x) {
    if(x<=0)return 0;
    else return Math.floor(Math.random() * x);
};
module.exports.getRandom = getRandom;
module.exports.isEmptyOrNull = isEmptyOrNull;
module.exports.loadAllScript = loadAllScript;
module.exports.removeElement = removeElement;