/**
 * 接收資訊
 * @typedef {Object} clientData
 * @property {number} services 服務 services:behaviors
 * @property {object} data 資訊內容 //接收到時會新增behaviors
 */

 /**
 * 回傳資訊
 * @typedef {Object} responseData
 * @property {number} services 服務 services:behaviors
 * @property {object} data 資訊內容
 */

/**
 * soket新增的內容
 * @typedef {Object} sokcet
 * @property {number} uid 辨識碼
 * @property {object} heartbeat 心跳機制
 */

 /**
 * 房間物件
 * @typedef {Object} room
 * @property {number} id 唯一碼
 * @property {String} name 房間名稱
 * @property {String} password 密碼
 * @property {String} maxPlayer 最大人數
 * @property {number[]} Players 玩家數
 */

//array可以break的
// function GetRoom(roomId){
//     var correctRoom = null;
//     rooms.some(room=>{
//         if(room.id==roomId){
//             correctRoom = room
//             return true;
//         }
//     })
//     return correctRoom;
// }