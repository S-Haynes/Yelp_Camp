const express 	 = require('express');
const router  	 = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware/middleware.js');

//campground index route
router.get('/', function(req, res){
	let perPage = 8;
	let pageQuery = parseInt(req.query.page);
	let pageNumber = pageQuery ? pageQuery : 1;
	//get all campgrounds from DB
	Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, campgrounds){
		
		Campground.count().exec(function(err, count){
			if(err){
				console.log(err)
			} else {
				res.render('campgrounds/index', {
					campgrounds: campgrounds,
					current: pageNumber,
					pages: Math.ceil(count / perPage)

				});
			}
		});
		
	});

});

//campground create routes
router.get("/new", middleware.checkLoginStatus, function(req, res){
	res.render('campgrounds/new');
});

router.post('/', middleware.checkLoginStatus, function(req, res){
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
	});

});


//campground review route
router.get("/:id", function(req, res){
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

//campground update routes
router.get("/:id/edit", middleware.checkLoginStatus, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash('error', 'Something went wrong. Try again.')
			res.redirect('/campgrounds/' + req.params.id + '/edit')
		} else {
			res.render('campgrounds/edit', {campground: campground});
		}
	});	
});

router.put('/:id', middleware.checkLoginStatus, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		if(err){
			console.log(err)
		} else {
			campground.save();
			res.redirect('/campgrounds/' + req.params.id)
		}
	});
});


// campground delete route
router.delete('/:id', middleware.checkLoginStatus, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err)
		} else {
			res.redirect('/campgrounds')
		}
	});
});

module.exports = router;