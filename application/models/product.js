let config = require('../config/database');
function Product() {
    let mysql = require('mysql');
    this.connection = mysql.createPool(config);
}

Product.prototype.all = function(done){
    this.connection.query('SELECT * FROM products ORDER BY id DESC', function(err, rows, fields) {
        if (err) throw done(err);
        done(null, rows)
    });
}
Product.prototype.add = function (data,done){
    this.connection.query('INSERT INTO products SET ?', data, function(err, result){
        if (err) return done(err);
        return done(null, result.insertId)
    });
}
Product.prototype.delete = function (id,done){
    this.connection.query('DELETE FROM `products` WHERE id = ?', id, function(err, result){
        if (err) return done(err);
        return done(null, result.affectedRows);
    });
}


module.exports = new Product();
