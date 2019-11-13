module.exports = {
    secret:"qdedf-asdv@asdf32#",
    db:
    {
        schema:"game_server",
        account:"root",
        password:"123456",
        option:
        {
            host: "localhost",
            dialect: "mysql",
            define:{
                charset: "utf8",
                collate: "utf8_unicode_ci"
            },
            /**
             * 單純資料
             */
            query: { raw: true },
            /**
             * 不顯示consle.log
             */
            logging: false,
        }
    },
    socket:
    {
        port:1337
    },
    http:
    {
        port:12121
    },
    /**
     * 用戶中心的ip
     */
    user_center_url : "http://localhost:9000/",
}