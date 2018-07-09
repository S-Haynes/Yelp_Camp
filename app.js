const express 				= require('express');
const app 					= express();
const bodyParser 			= require('body-parser');
const mongoose 				= require('mongoose');
const passport 				= require('passport');
const LocalStrategy 		= require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const methodOverride 		= require('method-override');
const session 				= require('express-session');
const flash 				= require('connect-flash');
const Comment 				= require('./models/comment');
const User 					= require('./models/user');
const Campground            = require('./models/campground');

//require routes
const commentRoutes     = require('./routes/comments');
const campgroundRoutes  = require('./routes/campgrounds');
const indexRoutes       = require('./routes/index');


//create database
mongoose.connect('mongodb://localhost/yelp_camp');

//app config
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.locals.moment = require('moment');

//set view engine to ejs
app.set('view engine', 'ejs');

//express session config
app.use(session({
	secret: 'this is an awesome website luci created',
	resave: false,
	saveUninitialized: false
}));

//passport auth config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

//global app variables
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//tell the app to use these routes
app.use('/', indexRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);

// listen on port 3000 for server startup
app.listen(process.env.PORT || 3000, function(){
	console.log('server started');
});