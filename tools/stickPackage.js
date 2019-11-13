/**
 * 拚黏資料與傳送資料
 */
class StickPackage {
    //#region header 相關數值
    /**
     * header的長度(佔用空間)
     * @type {number}
     */
    static get headerSize() {
        return this.totalSize + this.typeSize + this.countClassNameSize + this.classNameSize + this.uuidSize;
    }
    /**
     * 0是Class資料
     * 1是RPC方法
     */
    static get typeSize() {
        return 1;
    }
    /**
     * 資料長度(佔用空間)
     * max uint 4,294,967,295
     */
    static get totalSize() {
        return 4;
    }
    /**
     * 類別長度(佔用空間)
     * max uint8 255
     */
    static get countClassNameSize() {
        return 1;
    }
    /**
     * 類別名稱寫入空間(佔用空間)
     */
    static get classNameSize() {
        return 30;
    }
    /**
     * 唯一碼(佔用空間)
     * max uint 4,294,967,295
     */
    static get uuidSize() {
        return 4;
    }
    //#endregion 

    /**
     * 設定傳送資料
     * @param {string} className 類別名稱
     * @param {*} data 資料物件
     * @param {number} type 資料類型 ClassData/RPC
     * @param {number} uid 是否使用uuid;
     */
    static setSendData(className, data, type, uid = 0) {
        className = className || "";
        let offset = 0;
        let dataStr = "";
        let dataLength = 0;//資料總長度
        if (data != null) {
            dataStr = JSON.stringify(data);
            dataLength = Buffer.byteLength(dataStr, 'utf8');//資料總長度
        }
        let total = this.headerSize + dataLength;//資料總長度+header長度
        if (total <= 1024 * 1024 * 1024) {
            let buf = Buffer.allocUnsafe(total);//new Buffer
            //寫入總長度
            //console.log(total);
            buf.writeInt32LE(total, offset);
            offset += this.totalSize;
            //資料類別
            buf.writeUInt8(type, offset);
            offset += this.typeSize;
            //寫入類別名稱長度
            let countClassName = Buffer.byteLength(className, 'utf8');
            buf.writeUInt8(countClassName, offset)
            offset += this.countClassNameSize;
            //寫入類別名稱
            buf.write(className, offset, "utf8");
            offset += this.classNameSize;
            //寫入uuid
            if (uid) {
                buf.writeUInt32LE(uid, offset);
            }
            else buf.writeUInt32LE(0, offset);
            offset += this.uuidSize;
            //寫入資料
            buf.write(dataStr, offset, "utf8");
            console.log("=================發出================");
            console.log(uid, type, className, dataStr);
            return buf;
        }
        else {
            console.log("data is bigger over 1G");
            return null;
        }

    }

    /**
     * 初始化
     */
    constructor() {
        /**
          * 完成時的CallBack
          * @param {number} uuid 流水號
          * @param {number} type 傳送格式
          * @param {string} className 類別名
          * @param {string} str Json
          * @param {StickPackage} sp 本體
          */
        this.onCompleteCallBack = function (uuid, type, className, str, sp) { console.log(uuid); console.log(type); console.log(className); console.log(str); };
        /**
         * 是否正在拚黏Header
         */
        this.combineHeader = false;
        /**
         * 是否正在拚黏Body
         */
        this.combineBody = false;
        /**
         * 偏移
         */
        this.offset = 0;
        /**
         * @type {Buffer}
         */
        this.stickBuffer = null;
        /**
         * 請求流水編號
         */
        this.uuid = 0;
        /**
         *  @type {import("net").Socket}
         */
        this.socket = null;
        this.isAlive = true;
        this.syncTimeout = 0;
        /**
         * 每個唯一碼(綁定玩家id)
         */
        this.unique = 0;
        /**
         * @type {{number:Function}}
         */
        this.rpcCallBack = {};
        /**
         * 登入成功後獲得的認證碼
         */
        this.httpToken = "";
        /**
         * 斷線重連
         * @type {function(StickPackage):void}
         */
        this.onReonnectFunction = function (sp) { };
    }

    /**
     * 拚黏資料
     * @param {Buffer} buf 
     */
    stick(buf) {
        //是否正在拚黏
        if (this.combineBody || this.combineHeader) {
            let subtract = this.stickBuffer.length - this.offset;
            if (buf.length < subtract) {
                buf.copy(this.stickBuffer, this.offset);
                this.offset += buf.length;
            }
            else {
                //拚黏Body
                if (this.combineBody && !this.combineHeader) {
                    buf.copy(this.stickBuffer, this.offset, 0, subtract);
                    this.paresData(this.stickBuffer);
                    this.combineBody = false;

                    if (buf.length - subtract > 0) {
                        this.stick(buf.slice(subtract));
                    }
                }
                //拚黏Header
                else {
                    this.stickBuffer = Buffer.concat([this.stickBuffer.slice(0, subtract), buf]);
                    this.combineHeader = false;
                    this.stick(this.stickBuffer);
                }
            }
        }
        else {
            if (buf.length >= StickPackage.totalSize) {
                //讀取總長度
                let total = buf.readUInt32LE(0);
                if (buf.length == total) {
                    //已取得全部資料
                    this.paresData(buf);
                }
                else if (buf.length < total) {
                    //開始拚黏所有資料
                    this.combineBody = true;
                    this.stickBuffer = Buffer.allocUnsafe(total);
                    this.offset = 0;
                    buf.copy(this.stickBuffer);
                    this.offset += buf.length;
                }
                else {
                    //拚黏完成
                    this.paresData(buf.slice(0, total));
                    if (total < buf.length) this.stick(buf.slice(total));
                }
            }
            else {
                //使拚黏header
                this.combineHeader = true;
                this.stickBuffer = Buffer.allocUnsafe(4);
                this.offset = 0;
                buf.copy(this.stickBuffer, this.offset);
                this.offset += buf.length;
            }
        }
    }

    /**
     * 解析資料
     * @param {Buffer} buf 
     */
    paresData(buf) {
        let offset = 4;
        //console.log(buf.length);
        //讀取資料類型
        let type = buf.readUInt8(offset);
        offset += StickPackage.typeSize;
        //讀取className長度
        let countClassName = buf.readUInt8(offset);
        offset += StickPackage.countClassNameSize;
        //解析className
        let cn = buf.toString("utf8", offset, offset + countClassName);
        offset += StickPackage.classNameSize;
        //解析uuid
        let uuid = buf.readUInt32LE(offset);
        offset += StickPackage.uuidSize;
        //解析資料
        let dataStr = buf.toString("utf8", offset);
        this.onCompleteCallBack(uuid, type, cn, dataStr, this);
    }

    /**
     * 
     * @param {number} type 
     * @param {string} msg 
     */
    close(type, msg) {
        let data = { type: type, msg: msg }
        let buf = StickPackage.setSendData("ErrorMessage", data, 1);
        this.socket.end(buf);
    }
}
module.exports = StickPackage;