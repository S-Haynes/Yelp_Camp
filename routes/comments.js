const express = require('express');
const router  = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware/middleware.js');

//create comment route
router.get('/new', middleware.checkLoginStatus, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			res.render('comments/new', {campground: campground})
		}
	});

});

router.post('/', middleware.checkLoginStatus, function(req, res){

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

//update comment route
router.get('/:comment_id/edit', middleware.checkLoginStatus, function(req, res){

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

router.put('/:comment_id', function(req, res){
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

//delete comment route
router.delete('/:comment_id', function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash('error', err.message)
		} else {
			res.redirect('/campgrounds/' + req.params.id)
		}
	});
});

module.exports = router;