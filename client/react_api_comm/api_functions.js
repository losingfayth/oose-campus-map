// functions to make calls to server

/* 
Makes an Http GET request to server endpoint get-locations.
Returns a list of nodes representing all locations stored in database. Each node
contains the following attributes: location code, floor, building, display name, isValidDestination
*/
async function getBuildings() {
    console.log("Running getBuildings()");
    try {

        // use fetch to make an http request to server at get-location endpoint
        const response = await fetch("https://apibloomap.xyz:5164/api/CampusMap/get-buildings");
        
        
        console.log("Raw response:", response);  // Check the full response object
        const data = await response.json();
        console.log("Parsed JSON:", data);
        // const data = await response.json();
        // console.log(data.stringify);


        // throw error if fetch is unsuccessful
    } catch (error) {
        console.error("Error fetching buildings: ", error);
    }

}

/* 
Makes an Http GET request to server endpoint get-locations.
Returns a list of nodes representing all locations stored in database. Each node
contains the following attributes: location code, floor, building, display name, isValidDestination
*/
async function getRooms(building) {
    console.log("Running getRooms()");
    try {

        // use fetch to make an http request to server at get-location endpoint
         // use fetch to make an http request to server at find-path endpoint
         const response = await fetch("https://apibloomap.xyz:5164/api/CampusMap/get-rooms", {
            method: "POST", // http POST request
            headers: {"Content-Type": "application/json"}, // sending data as json
            body: JSON.stringify({buildings}) // convert js to json before sending
        });
        
        
        console.log("Raw response:", response);  // Check the full response object
        const data = await response.json();
        console.log("Parsed JSON:", data);
        // const data = await response.json();
        // console.log(data.stringify);


        // throw error if fetch is unsuccessful
    } catch (error) {
        console.error("Error fetching rooms: ", error);
    }

}

/*
Makes an Http POST request to server endpoint find-path. Sends the user's current location and desired destination.
Returns 
*/
async function findPath(currLoc, destination) {


    console.log("Running FindPath()");
    try {

        // use fetch to make an http request to server at find-path endpoint
        const response = await fetch("https://apibloomap.xyz:5164/api/CampusMap/find-path", {
            method: "POST", // http POST request
            headers: {"Content-Type": "application/json"}, // sending data as json
            body: JSON.stringify({currLoc, destination}) // convert js to json before sending
        });
        
        
        console.log("Raw response:", response);  // Check the full response object
        const data = await response.json();
        console.log("Parsed JSON:", data);
        // const data = await response.json();
        // console.log(data.stringify);


        // throw error if fetch is unsuccessful
    } catch (error) {
        console.error("Error fetching path: ", error);
    }

    // const data = await response.json();        
    // console.log(data);


    // // once a response is revieved from the server, convert json object into
    // // javascript object
    // return response.json();
}