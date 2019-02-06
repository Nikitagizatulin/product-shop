let express = require('express');
let router = express.Router();
const Product = require('../models/product');
const User = require('../models/users');

router.get('/', function(req, res, next) {
    Product.all(function (err,result){
        if(err){throw err}
        let options = {
            title: 'All product',
            active:'allproduct',
            data:null,
            success:req.session.success
        };
        req.session.success = null;
        if(result && result.length!==0){
            options.data = result;
            res.render('admin/allproduct',options);
        }else{
            res.render('admin/allproduct', options);
        }
    });

});
router.get('/users', function(req, res, next) {
    User.all(function (err,result){
        if(err){throw err}
        let options = {
            users: result && result.length!==0 ? result : null,
            title: 'All of products',
            authorised:true,
            active:'users',
            admin:true,
            success:req.session.success,
            errors:req.session.errors}
        req.session.success = null;
        req.session.errors = null;
        res.render('admin/users',options);
    });
});

router.get('/addproduct', function(req, res, next) {
    let options = {
        title: 'Add product',
        active:'addproduct',
        errors:req.session.errors,
    };
    req.session.error = null;
    res.render('admin/addproduct', options);
});

router.post('/delete', function(req, res, next) {
    if(req.body.product_id){
        Product.delete(req.body.product_id,function (err,done) {
            if(done){
                req.session.success = 'Product id: ' + req.body.product_id + ' was deleted!';
                res.redirect('back');
            }else{
                req.session.errors = 'This product was not deleted. Probably some error in database';
                res.redirect('back');
            }
        });
    }else{
        req.session.errors = 'Id of product not found';
        res.redirect('back');
    }
});

router.post('/addproduct',function (req, res, next) {
    req.check('title','Invalid title of product. It`s must be string min length - 4, max length - 200').isLength({min:4,max:200});
    req.check('price','Invalid price of product. It`s must be number min length - 1, max length - 11').isNumeric().isLength({min:1,max:11});
    req.check('description','Invalid description of product. It`s must be string min length - 4, max length - 500').isLength({min:4,max:500});
    let errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        res.redirect('back');
    }else{
        Product.add(req.body,(err,result)=>{
            if(err){throw err}
            if(result){
                req.session.success = 'Add new product id = ' + result;
                res.redirect('/admin');
            }else{
                req.session.errors = {msg:'Product don`t add. Problem with add in database.'};
                res.redirect('back');
            }
        });
    }
});

router.post('/deluser',function (req, res, next) {
    if(req.body.user_id){
        User.delete(req.body.user_id,function (err,done) {
            if(done){
                req.session.success = 'User id: ' + req.body.user_id + ' was deleted!';
                res.redirect('back');
            }else{
                req.session.errors = 'This user was not deleted. Probably some error in database';
                res.redirect('back');
            }
        });
    }else{
        req.session.errors = 'User id is not found';
        res.redirect('back');
    }
});

module.exports = router;
