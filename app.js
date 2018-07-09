const express 				= require('express');
const app 					= express();
const bodyParser 			= require('body-parser');
const mongoose 				= require('mongoose');
const passport 				= require('passport');
const LocalStrategy 		= require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const methodOverride 		= require('method-override');
const session 				= require('express-session');
const flash 				= require('connect-flash')

// create a yelpcamp database
mongoose.connect('mongodb://localhost/yelp_camp');

//app config
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.locals.moment = require('moment');

//set view engine to ejs
app.set('view engine', 'ejs');

// MONGOOSE SCHEMA SETUP

// comment schema
let commentSchema = new mongoose.Schema({
	text: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	created: {
		type: Date,
		default: Date.now
	}
});

let Comment = mongoose.model('Comment', commentSchema);

//campground schema
let campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	created: {
		type: Date,
		default: Date.now
	}
});

let Campground = mongoose.model("Campground", campgroundSchema);

//user schema 

let userSchema = new mongoose.Schema({
	username: String,
	password: String
});

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model('User', userSchema);

//auth config
app.use(session({
	secret: 'this is an awesome website luci created',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});


	

//Campground Routes
app.get('/', function(req, res){
	res.render('home');
});

app.get('/campgrounds', function(req, res){

	//get all campgrounds from DB
	Campground.find({}, function(err, campgrounds){
		if(err){
			console.log(err)
		} else {
			res.render('campgrounds/index', {campgrounds: campgrounds});
		}
	})

});

app.post('/campgrounds', checkLoginStatus, function(req, res){
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let newCampground = {name: name, image: image, description: desc}
	//Create a new campground and save to DB
	Campground.create(newCampground, function(err, campground){
		if(err){
			console.log(err)
		} else {
			campground.author.id = req.user._id;
			campground.author.username = req.user.username;
			campground.save();
			res.redirect('/campgrounds');
		}
	})

});

//create a campground
app.get("/campgrounds/new", checkLoginStatus, function(req, res){
	res.render('campgrounds/new');
});

//review a campground
app.get("/campgrounds/:id", function(req, res){
	//find the campground with provided ID
	let id = req.params.id
	Campground.findById(id).populate('comments').exec(function(err, foundCampground){
		if(err){
			console.log(err)
			req.flash('error', 'Something went wrong. We redirected you back home.')
			res.redirect('/campgrounds')
		} else {
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
});

//update a campground
app.get("/campgrounds/:id/edit", checkLoginStatus, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash('error', 'Something went wrong. Try again.')
			res.redirect('/campgrounds/' + req.params.id + '/edit')
		} else {
			res.render('campgrounds/edit', {campground: campground});
		}
	});	
});

app.put('/campgrounds/:id', checkLoginStatus, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		if(err){
			console.log(err)
		} else {
			campground.save();
			res.redirect('/campgrounds/' + req.params.id)
		}
	});
});


app.delete('/campgrounds/:id', checkLoginStatus, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err)
		} else {
			res.redirect('/campgrounds')
		}
	})
});




// Comment Routes

//create comment
app.get('/campgrounds/:id/comments/new', checkLoginStatus, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			res.render('comments/new', {campground: campground})
		}
	});

});

app.post('/campgrounds/:id/comments', checkLoginStatus, function(req, res){

	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err)	
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash('success', 'Comment added successfully');
					res.redirect('/campgrounds/' + req.params.id);
				}
			})
		}
	});
	
});

//update comment
app.get('/campgrounds/:id/comments/:comment_id/edit', checkLoginStatus, function(req, res){

	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			Comment.findById(req.params.comment_id, function(err, comment){
				if(err){
					console.log(err)
				} else {
					res.render('comments/edit', {comment: comment, campground: campground});	
				}
			})
		}
	});		
});

app.put('/campgrounds/:id/comments/:comment_id', function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
		if(err){
			req.flash('error', err.message)
			res.redirect('/campgrounds/' + req.params.id)
		} else {
			comment.save();
			req.flash('success', 'Comment updated successfully.')
			res.redirect('/campgrounds/' + req.params.id)
		}
	});
});
//delete comment

app.delete('/campgrounds/:id/comments/:comment_id', function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash('error', err.message)
		} else {
			res.redirect('/campgrounds/' + req.params.id)
		}
	});
});
// user login routes

//signup
app.get('/signup', function(req, res){
	res.render('auth/signup')
});


app.post('/signup', function(req, res){
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
app.get('/login', function(req, res){
	res.render('auth/login');
});

app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true
}), 
	function(req, res){
	req.flash('success', 'Welcome back, ' + req.user.username + '.');
	res.redirect('/campgrounds');
});

//logout

app.get('/logout', checkLoginStatus, function(req, res){
	req.flash('success', 'Logged out successfully. Visit us again, ' + req.user.username + '.')
	req.logout();
	res.redirect('/campgrounds')
});

//middleware 

function checkLoginStatus(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} 
	req.flash('error', 'You need to log in to do that.');
	res.redirect('/login');
}
// listen on port 4000 for server startup
app.listen(process.env.PORT || 3000, function(){
	console.log('server started');
});