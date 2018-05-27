"use strict";
const Fs = require('fs');

module.exports ={
    /**
     * 讀取路徑下所有js
     * 將方法裝成Object回傳
     * @param {string} path
     * @return {{string:function}}
     */
    LoadAllScript : function(path){
        var methods={};
        var files =  Fs.readdirSync(path);
        files.forEach(file=>{
            var filename = file.split(".")[0];
            methods[filename] = require(path+'/'+file);
        })
        return methods;
    }
}