"use strict";
var Express = require('express');  
var Xlsx = require('xlsx');  
var BodyParser = require('body-parser');
var Multer  = require('multer');//解析form-data
var upload = Multer();

var app = Express();  
app.use(BodyParser.json());  
app.use(BodyParser.urlencoded({ extended: true, limit: '100mb' }));

//上傳Excel表格'excel'名稱
app.post('/',upload.single('excel'),function(req, res, next) {  
    var excel = req.file.buffer;
    var workbook = Xlsx.read(excel);
     // read from a file  
    res.send('import successfully!');  
});  
app.listen(1992,'0.0.0.0'); 