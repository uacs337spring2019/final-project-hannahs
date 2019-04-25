/**
	Author: Hannah Smith
	Course: CSc 337
	Purpose: This file provides the Node.js code for the 337 final 
	project. This particular project is a web app that allows users to 
	post reviews of public restrooms. This file initializes the map and 
	makes the appropriate calls to the service to load the appropriate
	information.
*/

(function () {
	"use strict";

	const express = require("express");
	const app = express();

	const fs = require('fs');

	const bodyParser = require('body-parser');
	const jsonParser = bodyParser.json(); 

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", 
			"Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.use(express.static('public'));

	/**
		readFile(folder) : This function opens a file and returns it's contents
		as a string. Throws an error if unable to open file.
		@param {String} fileName- the specified file to read
		@return {String} - the contents of the file
	*/
	function readFile(fileName) {
		let file;
		try {
			file = fs.readFileSync(fileName, 'utf8');
		} catch(e) {
			console.log('Error: ', e.stack);
		}
		return file;
	}

	/**
		getBasic(directory) : This function reads the info.txt file in the specified 
		folder and returns the first 3 lines (the basic info) as a JSON object.
		@param {String} directory - the specified directory to look at
		@returns {JSON object} - relavent data
	*/
	function getBasic(directory) {
		let basic = readFile("places/" + directory + "/info.txt");
		let lines = basic.split('\n');
		let place = {"folder" : directory, "name" : lines[0], "address" : lines[1], 
		"type" : lines[2], "rating" : lines[3]};
		return place;
	}

	/**
		getInfo(directory) : This function reads the info.txt file in the specified 
		folder and returns the contents as a JSON object.
		@param {String} directory - the specified directory to look at
		@returns {JSON object} - relavent data
	*/
	function getInfo(directory) {
		let info = readFile("places/"+directory+"/info.txt");
		let lines = info.split('\n');
		let place = {"folder" : directory, "name" : lines[0], "address" : lines[1], 
			"type": lines[2], "rating" : lines[3], "hours" : lines[4], "style" : lines[5], 
			"CO" : lines[6], "baby" : lines[7], "unisex" : lines[8], "wheelchair" : lines[9], 
			"family" : lines[10]};
		// style = stalls or single
		// CO = customers only
		return place;
	}

	/**
		getReviews(directory) : This function reads the reviews.txt file in the specified 
		folder and returns the contents as a JSON object.
		@param {String} directory - the specified directory to look at
		@returns {JSON object} - relavent data
	*/
	function getReviews(directory) {
		let file = readFile("places/" + directory + "/reviews.txt");
		let lines = file.split('\n');
		let reviews = [];
		for (let i = 0; i < lines.length; i ++) {
			let info = lines[i].split(':::');
			reviews[i] = {"folder" : directory, "name": info[0], "rating": info[1], 
				"review": info[2]};
		}
		return {reviews};
	}

	/**
		getBasic(directory) : This function reads the info.txt file in the ALL the  
		folders and returns the first 3 lines (the basic info) of each as a list.
		@returns {list} - relavent data
	*/
	function getAllBasic() {
		let folders = fs.readdirSync(process.cwd() + "/places");
		let places = [];
		for (let i = 1; i < folders.length; i ++) {
			let info = getBasic(folders[i]);
			places[i-1] = info;
		}
		return places;
	}

	// GET:
	console.log('web service started');
	app.get('/', function (req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		// get query parameters:
		let mode = req.query.mode;
		let location = req.query.place;

		if (mode === "listinfo") {
			let places = [];
			let directories = fs.readdirSync(process.cwd() + "/places");
			for (let i = 1; i < directories.length; i ++) {
				let place = getBasic(directories[i]);
				places[i-1] = place;
			}
			places = {places};
			res.send(JSON.stringify(places));
		} else if (mode === "moreinfo") {
			let info = getInfo(location);
			res.send(JSON.stringify(info));
		} else if (mode === "reviews") {
			let reviews = getReviews(location);
			res.send(JSON.stringify(reviews));
		} else if (mode === "map") {
			let places = getAllBasic();
			res.send(JSON.stringify({places}));
		}
	});

	// POST:
	app.post('/', jsonParser, function (req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		

		// JUST POST SINGLE REVIEW:
		let folder = req.body.folder;
		let name = req.body.name;
		let rating = req.body.rating;
		let comment = req.body.comment;

		let review = "\n" + name + ":::" + rating + ":::" + comment;
		fs.appendFile(process.cwd() + "/places/" + folder + "/reviews.txt", review, function(err) {
			if (err) {
				console.log(err);
				res.status(400);
				res.send('Error submitting review');
			}
			res.send('Review successfully submitted!');
		});

	});
	//app.listen(process.env.PORT);
	app.listen(3000);
})();


