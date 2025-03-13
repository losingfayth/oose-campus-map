// functions to make calls to server

/* 
Makes an Http GET request to server endpoint get-locations.
Returns a list of nodes representing all locations stored in database. Each node
contains the following attributes: location code, floor, building, display name, isValidDestination
*/
async function getLocations() {
    console.log("Running getLocations()");
    try {

         // use fetch to make an http request to server at get-location endpoint
        const response = await fetch("https://apibloomap.xyz:5164/api/CampusMap/get-locations");
        
        
    console.log("Raw response:", response);  // Check the full response object
    const data = await response.json();
    console.log("Parsed JSON:", data);
        // const data = await response.json();
        // console.log(data.stringify);


        // throw error if fetch is unsuccessful
    } catch (error) {
        console.error("Error fetching locations: ", error);
    }

}

/*
Makes an Http POST request to server endpoint find-path. Sends the user's current location and desired destination.
Returns 
*/
async function findPath(currLoc, destination) {

    console.log("Running findPath()");

    // use fetch to make an http request to server at find-path endpoint
    const response = await fetch("https://apibloomap.xyz:5164/api/CampusMap/find-path", {
        method: "POST", // http POST request
        headers: {"Content-Type": "application/json"}, // sending data as json
        body: JSON.stringify({currLoc, destination}) // convert js to json before sending
    });

    const data = await response.json();        
    console.log(data);


    // // once a response is revieved from the server, convert json object into
    // // javascript object
    // return response.json();
}