/**
	Author: Hannah Smith
	Course: CSc 337
	Purpose: This file provides the javascript code for the 337 final 
	project. This particular project is a web app that allows users to 
	post reviews of public restrooms. This file initializes the map and 
	makes the appropriate calls to the service to load the appropriate
	information.
*/
(function () {
	"use strict";

	let PORT = "process.env.PORT";
	let HOST = "https://fast-fortress-58476.herokuapp.com:";

	window.onload = function () {
		// homepage: 
		callAjax("listinfo", "none");

		// make header clickable:
		document.getElementById("title").onclick = function () {
			callAjax("listinfo", "none");
		};
	};
	/**
		callAjax(mode, place) -- Retrieves the appropriate information from
		the Node.js server and returns that information as a JSON object.
		@param {String} mode - GET argument
		@param {String} place - GET argument
	*/
	function callAjax(mode, place) {
		// place will be the directory name
		let url = HOST + PORT + "?mode="+mode+"&place="+place;
		fetch(url)
			.then(checkStatus)
			.then(function (responseText) {
				if (mode === "listinfo") {
					loadHomepage(responseText);
				} else if (mode === "reviews") {
					loadReviews(responseText);
				} else if (mode === "moreinfo") {
					loadMoreInfo(responseText);
				} else if (mode === "map") {
					initMap(responseText);
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	/**
		postAjax(info) -- Given a JSON object, this function sends that object
		to the Node.js server to post.
		@param {JSON object} info - the relavant information
	*/
	function postAjax(info) {
		const fetchOptions = {
			method : 'POST',
			headers : {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify(info)
		};

		let url = HOST + PORT + "?";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				document.getElementById("response2").innerHTML = responseText;
				// add return home button:
				let home = document.createElement("button");
				home.innerHTML = "Return Home";
				home.type = "button";
				document.getElementById("viewreviews").appendChild(home);
				home.onclick = function () {
					document.getElementById("viewreviews").style.display = "none";
					document.getElementById("homepage").style.display = "block";
					// reload homepage:
					document.getElementById("places").innerHTML = "";
					callAjax("listinfo", "none");
				};
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	/**
		loadHomepage(responseText) -- Given a JSON object, this function loads
		the data into the homepage divs. It loads the clickable list of reviewable
		establishments as well as makes the call to initialize the interactive map.
		@param {JSON object} responseText - the relavant information
	*/
	function loadHomepage(responseText) {
		document.getElementById("viewreviews").style.display = "none";
		document.getElementById("homepage").style.display = "block";
		document.getElementById("map").innerHTML = '';
		document.getElementById("places").innerHTML = '';

		let json = JSON.parse(responseText);
		let places = json.places;

		// Init map:
		callAjax("map", "none");

		for (let i = 0; i < places.length; i ++) {
			// Load image:
			let img = document.createElement("img");
			img.src = "places/"+ places[i].folder + "/img.jpg";

			// Load text for each individual place listing:
			let h3 = document.createElement("h3");
			h3.innerHTML = places[i].name;
			let p1 = document.createElement("p");
			p1.innerHTML = places[i].address;
			let rateDiv = document.createElement("div");
			rateDiv.id = "starDiv";
			let rating = places[i].rating;
			for (let i = 0; i < rating; i ++) {
				let star = document.createElement("img");
				star.className = "homeStar";
				star.src = "star.png";
				rateDiv.appendChild(star);
			}
			

			let div = document.createElement("div");
			div.className = "place";
			div.id = places[i].folder;
			div.appendChild(img);
			div.appendChild(h3);
			div.appendChild(p1);
			div.appendChild(rateDiv);
			div.onclick = function () {
				callAjax("moreinfo", div.id);
			};
			document.getElementById('places').appendChild(div);
		}
	}

	/**
		initMap(responseText) -- Given a JSON object, this function initializes the
		interactive map by placing clickable markers in the appropriate locations,
		in accordance with the JSON objects address data.
		@param {JSON object} responseText - the relavant information
	*/
	function initMap(responseText) {
		// Process JSON:
		let json = JSON.parse(responseText);
		let places = json.places;

		// Init map:
		let platform = new H.service.Platform({
			'app_id':'btIS6iT6IuLNur7a89Lt',
			'app_code':'9TqWkeJCx_coB4cnjqvc6A'
		});
		let defaultLayers = platform.createDefaultLayers();
		let map = new H.Map(
			document.getElementById('map'),
			defaultLayers.normal.map, 
			{
				zoom: 10,
				center: { lat: 32.2226, lng: -110.9747 }
		});
		// make map interactive
		new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
		// Create the default UI:
		H.ui.UI.createDefault(map, defaultLayers, 'en-US');

		// Container for marker info:
		let logContainer = document.createElement('ul');
					logContainer.className ='log';
					map.getElement().appendChild(logContainer);

		// Add markers to map:
		for (let i = 0; i < places.length; i ++) {
			let geocoder = platform.getGeocodingService(),
			geocodingParameters = {
				searchText: places[i].address,
				jsonattributes: 1
			};

			geocoder.geocode(
			geocodingParameters,
			// on success:
			function (result) {
				let locations = result.response.view[0].result[0].location;
				let marker = new H.map.Marker({lat: locations.displayPosition.latitude, 
										lng: locations.displayPosition.longitude});
					marker.addEventListener('pointerenter', function () {
					let entry = document.createElement('li');
					let br = document.createElement("br");
					entry.className = 'log-entry';
					entry.innerHTML = places[i].name;
					entry.appendChild(br);
					entry.innerHTML += places[i].address;
					entry.appendChild(br);
					entry.innerHTML += "Rating: " + places[i].rating + " stars";
					logContainer.insertBefore(entry, logContainer.firstChild);
				});
				marker.addEventListener('pointerleave', function () {
					logContainer.innerHTML = "";
				});
				marker.addEventListener('tap', function () {
					callAjax("moreinfo", places[i].folder);
				});
				map.addObject(marker);
			},
			// on error:
			function (error) {
				console.log(error);
			}
			);
		}
	}

	/**
		loadReviews(responseText) -- Given a JSON object, this function makes a 
		call to the Node.js server to retrieve the reviews and then loads them into
		the appropriate div.
		@param {JSON object} responseText - the relavant information
	*/
	function loadReviews(responseText) {
		// clear out any existing reviews:
		document.getElementById("reviews").innerHTML = "";
		let json = JSON.parse(responseText);
		let reviews = json.reviews;
		for (let i = 0; i < reviews.length; i ++) {
			let div = document.createElement("div");

			let name = document.createElement("div");
			name.className = "name";
			name.innerHTML = reviews[i].name;
			div.appendChild(name);

			let rating = document.createElement("div");
			rating.className = "indivRating";
			let num = reviews[i].rating;
			for (let i = 0; i < num; i ++) {
				let img = document.createElement("img");
				img.src = "star.png";
				img.alt = "star";
				rating.append(img);
			}
			div.appendChild(rating);

			let review = document.createElement("div");
			review.className = "review";
			review.innerHTML = reviews[i].review;
			div.appendChild(review);

			document.getElementById("reviews").appendChild(div);
		}

		document.getElementById("submitreview").onclick = function () {
			addSingleReview(reviews[0].folder);
		};
	}

	/**
		addSingleReview(directory) -- This function adds a review for the specified 
		establishment whose page the button is clicked on. It takes the information 
		from the form and stores it in a JSON object and passes that object on to be
		posted.
		@param {String} directory - a directory name
	*/
	function addSingleReview(directory) {
		// clear old reviews, so as not to reload them: 
		let name = document.getElementById("reviewername").value;
		let comment = document.getElementById("reviewtext").value;
		let rating = document.getElementById("reviewrating").value;

		if (name.length === 0 || comment.length === 0 || rating.length === 0) {
			document.getElementById("response2").innerHTML = "OOPS! Looks like you forgot \
			something... please fill out all fields before submitting.";
			return;
		}

		const info = {"folder" : directory, "name" : name, "rating" : rating, 
			"comment": comment};

		postAjax(info);
	}

	/**
		loadMoreInfo(responseText) -- Given a JSON object, this function loads
		the appropriate data into the moreinfo div.
		@param {JSON object} responseText - the relavant information
	*/
	function loadMoreInfo(responseText) {
		// hide other stuff:
		document.getElementById("homepage").style.display = "none";
		document.getElementById("viewreviews").style.display = "block";

		// clear any existing info:
		document.getElementById("leftdiv").innerHTML = "";
		document.getElementById("rightdiv").innerHTML = "";
		// clear "leave review area":
		document.getElementById("response2").innerHTML = "";
		document.getElementById("reviewername").value = "";
		document.getElementById("reviewrating").value = "";
		document.getElementById("reviewtext").value = "";

		let info = JSON.parse(responseText);

		let textDiv = document.createElement("div");
		textDiv.id = "text";
		let rightDiv = document.getElementById("rightdiv");		// right side of page
		let leftDiv = document.getElementById("leftdiv");
		
		// FORMAT: 
		// {"folder" : directory, "name" : lines[0], "address" : lines[1], "rating" : lines[2],
		// "hours" : lines[3], "style" : lines[4], "CO" : lines[5], "baby" : lines[6], "unisex" : 
		// lines[7], "wheelchair" : lines[8], "family" : lines[9]}

		// RATING:
		let rating = document.createElement("div");
		rating.className = "rating";
		rating.innerHTML = "Rating: ";
		let num = info.rating;
		for (let i = 0; i < num; i ++) {
			let star = document.createElement("img");
			star.src = "star.png";
			rating.appendChild(star);
		}
		rightDiv.appendChild(rating);

		// PICTURE:
		let img = document.createElement("img");
		img.src = "places/" + info.folder + "/img.jpg";
		rightDiv.appendChild(img);

		// HEADING:
		let h2 = document.createElement("h2");
		h2.innerHTML = info.name;
		leftDiv.appendChild(h2);

		// ESTABLISHMENT TYPE:
		let type = document.createElement("div");
		type.className = "type";
		type.innerHTML = info.type;
		leftDiv.appendChild(type);

		// ADDRESS:
		let address = document.createElement("div");
		address.className = "address";
		address.innerHTML = info.address;
		leftDiv.appendChild(address);

		// HOURS:
		let hours = document.createElement("div");
		hours.className = "hours";
		hours.innerHTML =  "Hours: " + info.hours;
		leftDiv.appendChild(hours);

		// STALLS OR SINGLE:
		let style = document.createElement("div");
		let stallsimg = document.createElement("img");
		let singleimg = document.createElement("img");
		style.className += "style";
		style.innerHTML = "Stalls: ";
		if (info.style === "stalls") {
			stallsimg.src = "check.png";
		} else {
			stallsimg.src = "notcheck.png";
		}
		style.appendChild(stallsimg);
		style.innerHTML += "	Single: ";
		if (info.style === "single") {
			singleimg.src = "check.png";
		} else {
			singleimg.src = "notcheck.png";
		}
		style.appendChild(singleimg);
		textDiv.appendChild(style);

		// CUSTOMERS ONLY:
		let customers = document.createElement("div");
		customers.className = "customers";
		customers.innerHTML = "For use by customers only? ";
		let custimg = document.createElement("img");
		if (info.CO === "true") {
			custimg.src = "check.png";
		} else {
			custimg.src = "notcheck.png";
		}
		customers.appendChild(custimg);
		textDiv.appendChild(customers);

		// BABIES:
		let baby = document.createElement("div");
		baby.className = "baby";
		baby.innerHTML = "Changing table? ";
		let babyimg = document.createElement("img");
		if (info.baby === "true") {
			babyimg.src = "check.png";
		} else {
			babyimg.src = "notcheck.png";
		}
		baby.appendChild(babyimg);
		textDiv.appendChild(baby);

		// UNISEX:
		let unisex = document.createElement("div");
		unisex.className = "unisex";
		unisex.innerHTML = "Unisex option? ";
		let uniseximg = document.createElement("img");
		if (info.unisex === "true") {
			uniseximg.src = "check.png";
		} else {
			uniseximg.src = "notcheck.png";
		}
		unisex.appendChild(uniseximg);
		textDiv.appendChild(unisex);

		// WHEELCHAIR:
		let wheelchair = document.createElement("div");
		wheelchair.className = "wheelchair";
		wheelchair.innerHTML = "Wheelchair accessibility? ";
		let wheelimg = document.createElement("img");
		if (info.wheelchair === "true") {
			wheelimg.src = "check.png";
		} else {
			wheelimg.src = "notcheck.png";
		}
		wheelchair.appendChild(wheelimg);
		textDiv.appendChild(wheelchair);

		// FAMILY:
		let family = document.createElement("div");
		family.className = "family";
		family.innerHTML = "Family restroom? ";
		let famimg = document.createElement("img");
		if (info.family === "true") {
			famimg.src = "check.png";
		} else {
			famimg.src = "notcheck.png";
		}
		family.appendChild(famimg);
		textDiv.appendChild(family);

		leftDiv.appendChild(textDiv);

		// Load reviews:
		callAjax("reviews", info.folder);
	}

	/**
		checkStatus(response) -- This function processes the response
		status and acts appropriately. It either returns the response
		text if the response status is valid or returns a promise rejection
		if there was an error fetching the data. 
		@param {JSON object} response - response from the Node.js service
	*/
	function checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response.text();
		} else if (response.status === 404) {
			return Promise.reject(new Error(response.status));
		} else if (response.status === 410) {
			return Promise.reject(new Error(response.status));
		} else {
			return Promise.reject(new Error(response.status));
		}
	}

}) ();