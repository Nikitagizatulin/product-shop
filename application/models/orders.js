let config = require('../config/database');
function Order() {
    let mysql = require('mysql');
    this.connection = mysql.createPool(config);
}

Order.prototype.all = function(id,done){
    this.connection.query('SELECT products.*,orders.created_at FROM products JOIN orders WHERE orders.user_id = ? AND products.id = orders.product_id ORDER BY id DESC', id, function(err, rows, fields) {
        if (err) throw done(err);
        done(null, rows)
    });
}
Order.prototype.add = function (data,done){
    this.connection.query('INSERT INTO orders SET ?', data, function(err, result){
        if (err) return done(err);
        return done(null, result.insertId)
    });
}


module.exports = new Order();
