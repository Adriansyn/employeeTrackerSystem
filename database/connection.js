const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Adrian123&/()',
    database: 'employeeTrackerSystemDB'
});

module.exports = db;