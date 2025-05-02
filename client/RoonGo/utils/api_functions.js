// functions to make calls to server

const PORT = "5163";

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
export async function findPath(currLoc, destination) {
	console.log("Running FindPath()");
	var request = {
		"start": currLoc,
		"end": destination,
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