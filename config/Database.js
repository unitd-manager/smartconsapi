var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'newsmartcon',
   
});
db.connect(); 
module.exports = db;