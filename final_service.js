// FILE FORMAT:
// 		name
//		location/address
// 		cleanliness (out of 10)
//		hours
//		stalls vs single
//		"by customers only"
//		baby accomadations
//		unisex option
//		wheelchair accessibility
//		family restroom

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
	folder and returns the first 3 lines as a JSON object.
*/
function getBasic(directory) {
	let basic = readFile("places/" + directory + "/info.txt");
	let lines = basic.split('\n');
	let place = {"folder" : directory, "name" : lines[0], "address" : lines[1], "type" : lines[2],
		"rating" : lines[3]}
	return place;
}

/**
	getInfo(directory) : This function reads the info.txt file in the specified 
	folder and returns the contents as a JSON object.
*/
function getInfo(directory) {
	let info = readFile("places/"+directory+"/info.txt");
	let lines = info.split('\n');
	let place = {"folder" : directory, "name" : lines[0], "address" : lines[1], "type": lines[2],
		"rating" : lines[3], "hours" : lines[4], "style" : lines[5], "CO" : lines[6], 
		"baby" : lines[7], "unisex" : lines[8], "wheelchair" : lines[9], "family" : lines[10]};
	// style = stalls or single
	// CO = customers only
	return place;
}

function getReviews(directory) {
	let file = readFile("places/" + directory + "/reviews.txt");
	let lines = file.split('\n');
	let reviews = [];
	for (let i = 0; i < lines.length; i ++) {
		let info = lines[i].split(':::');
		reviews[i] = {"folder" : directory, "name": info[0], "rating": info[1], "review": info[2]};
	}
	return {reviews};
}

function getAllBasic() {
	let folders = fs.readdirSync("places");
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
		let directories = fs.readdirSync("places");
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
	// let folder = req.body.folder;
	// let name = req.body.name;
	// let address = req.body.address;
	// let type = req.body.type;
	// let rating = req.body.rating;
	// let hours = req.body.hours;
	// let style = req.body.style;
	// let customers = req.body.customers;
	// let baby = req.body.baby;
	// let unisex = req.body.unisex;
	// let wheelchair = req.body.wheelchair;
	// let family = req.body.family;
	// let comment = req.body.review;
	// let first = req.body.first;
	// let last = req.body.last;

	// let info = name + "\n" + address + "\n" + type + "\n" + rating + "\n" +
	// 	hours + "\n" + style + "\n" + customers + "\n" + baby + "\n" + unisex
	// 	+ "\n" + wheelchair + "\n" + family;

	// let dir = process.cwd() + "/places/" + folder;
	// if (!fs.existsSync(dir)) {
	// 	fs.mkdirSync(dir);
	// }

	// // write info file:
	// fs.writeFile(process.cwd() + "/places/" + folder + "/info.txt", info, function(err) {
	// 	if(err) {
	// 		console.log(err);
	// 		res.status(400);
	// 		res.send('Error submitting review.');
	// 	}
	// });

	// // write review file:
	// let review = first + " " + last[0] + ".:::" + rating + ":::" + comment;
	// fs.appendFile(process.cwd() + "/places/" + folder + "/reviews.txt", review, function(err) {
	// 	if(err) {
	// 		console.log(err);
	// 		res.status(400);
	// 		res.send('Error submitting review.');
	// 	}
	// 	res.send('Review successfully submitted!');
	// });

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

app.listen(3000);