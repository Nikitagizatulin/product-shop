let config = require('../config/database');
function Users() {
    let mysql = require('mysql');
    this.connection = mysql.createPool(config);
}

Users.prototype.all = function(done){
    this.connection.query('SELECT * FROM `users` WHERE `role` != "admin" ORDER BY id DESC', function(err, rows, fields) {
        if (err) throw done(err);
        done(null, rows)
    });
}

Users.prototype.delete = function(id,done){
    this.connection.query('DELETE FROM `users` WHERE id = ?',id, function(err, rows, fields) {
        if (err) throw done(err);
        return done(null, rows.affectedRows);
    });
}

Users.prototype.check = function(email,done){
    this.connection.query('SELECT * FROM users WHERE email = ?', email, function(err, rows, fields) {
        if (err) throw done(err);
        done(null, rows[0])
    });
}
Users.prototype.add = function (data,done){
    this.connection.query('INSERT INTO users SET ?', data, function(err, result){
        if (err) return done(err);
        return done(null, result.insertId);
    });
}

Users.prototype.findOne = function (data,done){
    this.connection.query('SELECT * from users WHERE `email` = ? AND `password` = ?',[data.email,data.password] , function(err, result){
        if (err) return done(err);
        return done(null, result[0])
    });
}
Users.prototype.findById = function (data,done){
    this.connection.query('SELECT * FROM users WHERE id = ?', data, function(err, result){
        if (err) return done(err);
        return done(null, result[0])
    });
}



module.exports = new Users();
