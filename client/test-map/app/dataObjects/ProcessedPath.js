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
        this.index = 0;
        this.pathData = pathData;
        this.locations = [];
        for (let i = 0; i < pathData.length; i++) {
            let data = {
                "latitude": pathData[i].latitude,
                "longitude": pathData[i].longitude,
                "floor": pathData[i].floor,
                "building": pathData[i].building,
            }
            this.locations.push(new LocationNode(data));
        }
    }

    hasNext() {
        return this.index < this.locations.length;
    }

    getNext() {
        if (this.hasNext()) {
            let next = this.locations[this.index];
            this.index++;
            return next;
        } else {
            return false;
        }
    }

    getLocation(index) {
        if (index >= 0 && index < this.locations.length) {
            return this.locations.index;
        } else {
            return false;
        }
    }

    getStringRepresentation() {
        let s = "";
        while (this.hasNext()) {
            let n = this.getNext();
            s += (n.getBuilding() + " FL" + n.getFloor() + " (" + n.getLatitude() + ", " + n.getLongitude() + ")\n");
        }
        return s;
    }

}

export default ProcessedPath;