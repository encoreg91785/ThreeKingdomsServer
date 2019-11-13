'use strict';
const fs = require('fs');
const Entity = require('../entity');

let allClass = Object.keys(Entity);
let nextLine = "\n";
let tab = "    ";
let classDefined = "using System.Collections.Generic;" + nextLine + "using UnityEngine;" + nextLine + "using RPC;" + nextLine + "public partial class {0} : Entity" + nextLine + "{" + nextLine + "{1}" + nextLine + "{2}" + nextLine + "}";
let newFunction = tab + "public {0} () {}"
let fieldStr = tab + "public {0} {1};" + nextLine;
if(fs.existsSync("./Class/")==false) fs.mkdirSync("./Class");
createSystemEnum();
createEntity();
/**
 * 創Entity Script
 */
function createEntity() {
    for (let i = 0; i < allClass.length; i++) {
        /**
         * @type {PropertyDecorator}
         */
        let classDecorator = Entity[allClass[i]];
        /**
         * @type {Entity}
         */
        let classObj = new classDecorator.prototype.constructor();
        let fields = Object.getOwnPropertyNames(classObj);
        let fieldsStr = "";
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let type = checkType(classObj[field]);
            if (field != "entityId") {
                fieldsStr += Stringformat(fieldStr, [type, field]);
            }
        }
        let method = Stringformat(newFunction, [classDecorator.name]);
        let classContent = Stringformat(classDefined, [classDecorator.name, fieldsStr, method]);
        console.log(classContent);
        fs.writeFileSync("./Class/" + "Entity" + classDecorator.name + ".cs", classContent);
    }
}

function createSystemEnum() {
    let classContent = "public enum SystemName {" + nextLine + "{0}" + nextLine + "}";
    let systems = fs.readdirSync("../system");
    let str = "";
    for (let i = 0; i < systems.length; i++) {
        let sys = systems[i];
        var filename = sys.split(".")[0];
        console.log(filename);
        if (i == systems.length - 1){
            str+=tab +filename;
        }
        else str += tab+filename + "," + nextLine;
    }

    classContent = Stringformat(classContent,[str])
    fs.writeFileSync("./Class/" + "SystemEnum" + ".cs", classContent);
}

/**
 * 檢查物件類別
 * @param {*} field 
 */
function checkType(field) {
    let type = "object";
    switch (typeof field) {
        case "string":
            type = "string";
            break;
        case "number":
            type = field % 1 === 0 ? "int" : "float";
            break;
        case "boolean":
            type = "bool";
            break;
        case "object":
            if (field.constructor === Array) {
                if (field.length == 3) {
                    type = "Vector3";
                }
                else {
                    let elType = checkType(field[0]);
                    type = "List<" + elType + ">";
                }
            } 
            else if (field.constructor === Date){
                type = "DateTime"
            }
        default:
            console.log("請給資料預設的值，無法判別類別預設為 object");
            break;
    }
    return type;
}

/**
 * 字串拼接
 * @param {string} str 字串
 * @param {string[]} replaceStr 替換
 */
function Stringformat(str, replaceStr) {
    for (var k in replaceStr) {
        str = str.replace(new RegExp("\\{" + k + "\\}", 'g'), replaceStr[k]);
    }
    return str;
}



