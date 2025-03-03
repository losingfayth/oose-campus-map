// endpoints

import React, { useState } from 'react';

// declare a new path finding function
const FindPath = () => {

    // state of start is set to an empty string, setStart will be a function
    // capable of updating the state of 'start'
    // start = current state value
    // setStart = function used to update the state
    // useState('') = initial value of start (an empty string)
    const [current, setCurrLoc] = useState(''); // user's curr location
    const [destination, setDest] = useState(''); // user's desired destination
    const [path, setPath] = useState(null); // path between two points
    const [error, setError] = useState(''); // error handling

    // boiler plate code for preventing the page from reloading
    const handleFindPath = async (e) => {
        e.preventDefault();

        // if the current uer location and destination are not set, throw an error
        if (!current || !destination) {
            setError('Please provide both start and end room.');
            return;
        }

        try {

            // make a POST request to the C# API endpoint for pathfinding
            const response = await fetch('https://apibloomap.xyz/api/CampusMap/FindPath', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                // send the user's current and destination locations to server
                body: JSON.stringify({current, destination}),
            });

            // if the server returns a bad response, throw an error
            if (!response.ok) {
                    throw new Error('Failed to find path');
            }

            // parse the json response from the server
            const data = await response.json();
            // update the path array variable with the path recieved from the server
            setPath(data.path);

        } catch (err) {
            setError('Error finding path: ' + err.message);
        }
    };
}

export default FindPath;



/*
NOTES


useState() is a function that returns an array with two elements:

    The current state value.
    A function that you can use to update the state.

*/