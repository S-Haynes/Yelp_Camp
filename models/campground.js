const mongoose = require('mongoose');

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

module.exports = mongoose.model("Campground", campgroundSchema);