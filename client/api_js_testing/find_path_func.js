async function findPath(currLoc, destination) {
    console.log("Running FindPath()");
    try {
      // use fetch to make an http request to server at find-path endpoint
      const response = await fetch(
        "https://75.97.208.114:5164/api/CampusMap/find-path",
        {
          method: "POST", // http POST request
          headers: { "Content-Type": "application/json" }, // sending data as json
          body: JSON.stringify({ currLoc, destination }), // convert js to json before sending
        }
      );
  
      console.log("Raw response:", response); // check the full response object
      const data = await response.json();
      console.log("Parsed JSON:", data);
  
      // throw error if fetch is unsuccessful
    } catch (error) {
      console.error("Error fetching path: ", error);
    }
}