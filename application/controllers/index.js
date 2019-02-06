let express = require('express');
let router = express.Router();
const User = require('../models/users');
const Product = require('../models/product');
const Order = require('../models/orders');
let passport = require('passport');
let stripe = require('stripe')('sk_test_sUAre3Dk4VpfktUYpQIXlIcn');

/* GET home page. */
router.get('/', function (req, res) {
    let variables = {};
    if (req.user) {
        if (req.user.role === 'admin') {
            variables = {
                title: 'All of products',
                authorised: true,
                admin: true
            };
        } else {
            variables = {
                title: 'All of products',
                authorised: true
            };
        }
        variables.userId = req.user.id;
    }
    Product.all(function (err, result) {
        if (err) {
            throw err
        }
        if (result && result.length !== 0) {
            variables.data = result;
        }
        variables.active = '/';
        variables.success = req.session.success;
        req.session.success = null;
        variables.title = 'All of products';
        res.render('index', variables);
    });

});

router.get('/cart', function (req, res, next) {
    if (req.user) {
        Order.all(req.user.id, function (err, result) {
            if (err) {
                throw err
            }
            res.render('cart', {
                title: 'Your history cart',
                active: 'cart',
                data: result,
                authorised: true,
                admin: req.user.role === 'admin'
            });
        });
    } else {
        res.redirect('/login')
    }
});

router.get('/login', function (req, res, next) {
    if (req.user) {
        req.session.success = 'You authorize now';
        res.redirect('/');
    } else {
        let options = {
            errors: req.session.errors,
            title: 'Login',
            active: 'login'
        };
        req.session.errors = null;
        res.render('login', options);
    }
});

router.post('/login', function (req, res, next) {
    req.check('email', 'Invalid email address').isEmail().isLength({min: 5, max: 100});
    req.check('password', 'Invalid password').isLength({min: 4, max: 140});
    let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('back');
    } else {
        passport.authenticate('local',
            function (err, user, info) {
                if (err) {
                    next(err);
                } else {
                    if (user) {
                        req.logIn(user, function (err) {
                            if (err) {
                                next(err)
                            } else {
                                req.session.success = 'Authorization Successful!'
                                res.redirect('/');
                            }
                        })
                    } else {
                        req.session.errors = info;
                        res.redirect('back');
                    }
                }
            }
        )(req, res, next);
    }
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/login');
});

router.get('/register', function (req, res, next) {
    let options = {
        errors: req.session.errors,
        title: 'Register',
        active: 'register'
    };
    req.session.errors = null;
    if (req.user) {
        req.session.errors = 'You authorize now';
        res.redirect('/');
    } else {
        res.render('register', options);
    }
});
router.post('/register', function (req, res, next) {
    req.check('email', 'Invalid email address').isEmail().isLength({min: 5, max: 100});
    req.check('password', 'Invalid password').isLength({min: 4, max: 140}).equals(req.body.confirm);
    let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('back');
    } else {
        User.check(req.body.email, function (err, result) {
            if (err || result) {
                req.session.errors = {msg: 'This email is already usage'};
                res.redirect('back');
            } else {
                User.add({
                    'email': req.body.email,
                    'password': req.body.password
                }, function (err, userId) {
                    if (err) {
                        throw err
                    }
                    if (userId) {
                        req.logIn({id: userId}, function (err) {
                            req.session.success = 'You registration successfully!'
                            err ? next(err) : res.redirect('/');
                        });
                    } else {
                        res.redirect('back');
                    }
                });
            }
        });
    }
});

router.post('/pay', function (req, res, next) {
    let token = req.body.stripeToken;
    let charcgeAmount = req.body.chargeAmount;
    let charge = stripe.charges.create({
        amount: charcgeAmount,
        currency: 'gbp',
        source: token
    }, function (err, charge) {
        if (err && err.type === 'StripeCardError') {
            console.log('Your card was declined');
        }
    });
    Order.add({product_id: req.body.productId, user_id: req.body.userId}, function (err, result) {
        if (err) {
            throw err
        }
        if (result) {
            req.session.success = 'Your payment was successful';
            res.redirect('/');
        } else {
            req.session.error = 'Your payment was declined';
            res.redirect('/');
        }
    });
});

module.exports = router;
