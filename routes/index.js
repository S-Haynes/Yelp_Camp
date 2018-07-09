const express  = require('express');
const router   = express.Router();
const User     = require('../models/user');
const passport = require('passport')

router.get('/', function(req, res){
	res.render('home');
});

router.get('/signup', function(req, res){
	res.render('auth/signup')
});


router.post('/signup', function(req, res){
	User.register({
		username: req.body.username
	}, req.body.password, function(err, newUser){
		if(err){
			console.log(err)
			req.flash('error', err.message)
			res.redirect('/signup');
		}
		newUser.save()
		passport.authenticate('local')(req, res, function(){
			req.flash('success', 'Welcome to YelpCamp ' + newUser.username)
			res.redirect('/campgrounds');
		})
	});	
});

//login 
router.get('/login', function(req, res){
	res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true
}), 
function(req, res){
	req.flash('success', 'Welcome back, ' + req.user.username + '.');
	res.redirect('/campgrounds');
});

//logout

router.get('/logout', checkLoginStatus, function(req, res){
	req.flash('success', 'Logged out successfully. Visit us again, ' + req.user.username + '.')
	req.logout();
	res.redirect('/campgrounds')
});

function checkLoginStatus(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} 
	req.flash('error', 'You need to log in to do that.');
	res.redirect('/login');
}

module.exports = router;