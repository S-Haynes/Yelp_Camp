const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
	

let campgrounds = [
	{name: 'Salmon Creek', image:'https://farm4.staticflickr.com/3924/14422533026_9be7d49684.jpg'},
	{name: 'Granite Hill', image:'https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg'},
	{name: "Mountain Goat's Rest", image:'https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg'},{name: 'Salmon Creek', image:'https://farm4.staticflickr.com/3924/14422533026_9be7d49684.jpg'},
	{name: 'Granite Hill', image:'https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg'},
	{name: "Mountain Goat's Rest", image:'https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg'},{name: 'Salmon Creek', image:'https://farm4.staticflickr.com/3924/14422533026_9be7d49684.jpg'},
	{name: 'Granite Hill', image:'https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg'},
	{name: "Mountain Goat's Rest", image:'https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg'},{name: 'Salmon Creek', image:'https://farm4.staticflickr.com/3924/14422533026_9be7d49684.jpg'},
	{name: 'Granite Hill', image:'https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg'},
	{name: "Mountain Goat's Rest", image:'https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg'},
	]


app.get('/', function(req, res){
	res.render('home');
});

app.get('/campgrounds', function(req, res){

	res.render('campgrounds', {campgrounds: campgrounds});
});

app.post('/campgrounds', function(req, res){
	let name = req.body.name;
	let image = req.body.image;
	let newCampground = {name: name, image: image}
	campgrounds.push(newCampground);
	res.redirect('/campgrounds')
});

app.get("/campgrounds/new", function(req, res){
	res.render('new');
});

// listen on port 4000 for server startup
app.listen(4000, function(){
	console.log('server started');
});