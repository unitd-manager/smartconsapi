var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pyramiddev',
    //database: 'pyramid'
});
db.connect(); 
module.exports = db;