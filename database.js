const mysql = require("mysql2");
require("dotenv").config(); 
const connectionpool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:"message_test",
    port: process.env.DB_PORT,
    // 無可用連線時是否等待pool連線釋放(預設為true)
    waitForConnections : true,
    // 連線池可建立的總連線數上限(預設最多為10個連線數)
    connectionLimit : 10
});

const promisePool = connectionpool.promise()

module.exports = promisePool
