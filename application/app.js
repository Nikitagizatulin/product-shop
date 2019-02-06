let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/users');
let indexRouter = require('./controllers/index');
let adminRouter = require('./controllers/admin');
const expressValodator = require('express-validator');
let app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValodator());
app.use(session({
    secret: process.env.SESSION_SECRET || 's3Cur3',
    name:'sessionId',
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: 600000 }
}));

app.use(passport.initialize());
app.use(passport.session());


const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'},
    function(username, password, done) {
        User.findOne({ email : username,password:password},function(err,user){
            if(err){
                return  done(err);
            }else{
                if(user){
                    return password === user.password ? done(null, user) : done(null, false, { message: 'Incorrect password' });
                }else{
                    return done(null, false, { message: 'Incorrect email address' });
                }
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        err ? done(err) : done(null,user);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin',mustAdminMw, adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    let options = {};
    if(req.user){
        if(req.user.role === 'admin'){
            options = {authorised:true,admin:true};
        }else{
            options = {authorised:true,admin:false};
        }
    }
    res.render('error',options);
});


function mustAdminMw(req, res, next){
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        res.redirect('/');
    }
}

module.exports = app;


