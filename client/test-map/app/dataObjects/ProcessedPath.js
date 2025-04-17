import LocationNode from "./LocationNode";

/*
    "areaId": 1,
    "isValidDestination": true,
    "latitude": 41.0069125,
    "name": "First Floor Main Entrance",
    "id": 1,
    "floor": 1.0,
    "locationCode": "87H52H42+QP6",
    "longitude": -76.448234375
*/

class ProcessedPath {

    constructor(pathData) {
        console.log("ProcessedPath: " + pathData)
        this.pathData = pathData;
        this.locations = [];
        for (let i = 0; i < pathData.length; i += 4) {
            let data = {
                "latitude": pathData[i],
                "longitude": pathData[i + 1],
                "floor": pathData[i + 2],
                "building": pathData[i + 3],
            }
            this.locations.push(new LocationNode(data));
        }
    }

}

export default ProcessedPath;