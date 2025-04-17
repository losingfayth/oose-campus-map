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

class LocationNode {

    constructor(data) {
        this.data = data;
    }

    getAreaID() {
        return this.data.areaId;
    }

    getIsValidDestination() {
        return this.data.isValidDestination;
    }

    getLatitude() {
        return this.data.latitude;
    }

    getLongitude() {
        return this.data.longitude;
    }

    getFloor() {
        return this.data.floor;
    }

    getLocationCode() {
        return this.data.locationCode;
    }

    getName() {
        return this.data.name;
    }

    getID() {
        return this.data.id;
    }
}

export default LocationNode;