const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// create a yelpcamp database
mongoose.connect('mongodb://localhost/yelp_camp');

//include body-parser
app.use(bodyParser.urlencoded({extended: true}));

//set view engine to ejs
app.set('view engine', 'ejs');

// MONGOOSE SCHEMA SETUP

let campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

let Campground = mongoose.model("Campground", campgroundSchema);
	
// Campground.create({
// 	name: 'Granite Hill', 
// 	image:'https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg',
// 	description: 'This is a huge granite hill, no bathrooms. No Water. Beautiful granite!'
// }, function(err, campground){
// 	if(err){
// 		console.log(err)
// 	} else {
// 		console.log("newly created campground")
// 		console.log(campground)
// 	}
// })

//Set up routes
app.get('/', function(req, res){
	res.render('home');
});

app.get('/campgrounds', function(req, res){

	//get all campgrounds from DB
	Campground.find({}, function(err, campgrounds){
		if(err){
			console.log(err)
		} else {
			res.render('index', {campgrounds: campgrounds});
		}
	})

});

app.post('/campgrounds', function(req, res){
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let newCampground = {name: name, image: image, description: desc}
	//Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err)
		} else {
			res.redirect('/campgrounds')
		}
	})

});

app.get("/campgrounds/new", function(req, res){
	res.render('new');
});


app.get("/campgrounds/:id", function(req, res){
	//find the campground with provided ID
	let id = req.params.id
	Campground.findById(id, function(err, foundCampground){
		if(err){
			console.log(err)
		} else {
			//render show template with that campground
			res.render("show", {campground: foundCampground});
		}
	});
	
	

});

// listen on port 4000 for server startup
app.listen(4000, function(){
	console.log('server started');
});