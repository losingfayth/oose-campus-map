// functions to make calls to server

const PORT = "5163";

export async function getClosedLocationIdFromBuildingNameFloorNumberAndGCSCoordinates(buildingInfo, userLocation) {
	console.log("Running getClosedLocationIdFromBuildingNameFloorNumberAndGCSCoordinates()");
	console.log("Building Info: ", buildingInfo.building, buildingInfo.floor);
	console.log("User Location: ", userLocation.latitude, userLocation.longitude);

	var request = {
		"building": buildingInfo.building,
		"floor": buildingInfo.floor,
		"latitude": userLocation.latitude,
		"longitude": userLocation.longitude
	};

	try {
		// use fetch to make an http request to server at get-location endpoint
		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/GetClosestLocation",
			{
				method: "POST", // http POST request
				headers: { "Content-Type": "application/json" }, // sending data as json
				body: JSON.stringify(request), // convert js to json before sending
			}
		);

		const data = await response.json();

		return data;

		// throw error if fetch is unsuccessful
	} catch (error) {
		console.error("Error fetching location: ", error);
	}
	// return null if error occurs
	return null;

}

/* 
Makes an Http GET request to server endpoint GetBuildings.
Returns a list of nodes representing all buidling locations stored in database. Each node
contains the following attributes: location code, floor, building, display name, isValidDestination
*/
export async function getBuildings() {
	console.log("Running getBuildings()");
	try {
		// use fetch to make an http request to server at get-location endpoint
		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/GetBuildings"
		);

		// console.log("Raw response:", response); // check the full response object
		const data = await response.json();
		// console.log("getBuildings Parsed JSON:", data);

		return data;

		// throw error if fetch is unsuccessful
	} catch (error) {
		console.error("Error fetching buildings: ", error);
	}
}

/* 
Makes an Http GET request to server endpoint GetRooms.
Returns a list of nodes representing all rooms in specified building stored in database.
Each node contains the following attributes: location code, floor, 
building, display name, isValidDestination
*/
export async function getRooms(building) {
	console.log("Running getRooms()");
	console.log(building);
	try {
		// use fetch to make an http request to server at GetLocation endpoint
		// use fetch to make an http request to server at FindPath endpoint
		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/GetRooms",
			{
				method: "POST", // http POST request
				headers: { "Content-Type": "application/json" }, // sending data as json
				body: JSON.stringify({ building }), // convert js to json before sending
			}
		);

		//console.log("Raw response:", response); // check the full response object
		const data = await response.json();
		//console.log("Parsed JSON:", data);
		return data;

		// throw error if fetch is unsuccessful
	} catch (error) {
		console.error("Error fetching rooms: ", error);
	}
}

/*
Makes an Http POST request to server endpoint FindPath. Sends the user's current location and desired destination.
Returns 
*/
export async function findPath(currLoc, destination, accessible = false) {
	console.log("Running FindPath()");
	var request = {
		"start": currLoc,
		"end": destination,
		"accessible": accessible
	}
	try {

		// use fetch to make an http request to server at FindPath endpoint
		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/FindPath",
			{
				method: "POST", // http POST request
				headers: { "Content-Type": "application/json" }, // sending data as json
				body: JSON.stringify(request), // convert js to json before sending
			}
		);

		return await response.json();

		// throw error if fetch is unsuccessful
	} catch (error) {
		console.error("Error fetching path: ", error);
	}
}

export async function getPois() {

	try {
		// use fetch to make an http request to server at get-location endpoint
		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/GetPois"
		);

		const data = await response.json();

		return data;

		// throw error if fetch is unsuccessful
	} catch (error) { console.error("Error running get: ", error); }

}

export async function getNearestBathroom(currLoc, gender) {

	try {
		var request = {
			"start": currLoc,
			"gender": gender
		}

		const response = await fetch(
			"https://apibloomap.xyz:" + PORT + "/api/CampusMap/GetNearestBathroom",
			{
				method: "POST", // http POST request
				headers: { "Content-Type": "application/json" }, // sending data as json
				body: JSON.stringify({ request }), // convert js to json before sending
			}
		);

		const data = await response.json();

		return data;

		// throw error if fetch is unsuccessful
	} catch (error) { console.error("Error running get: ", error); }

}