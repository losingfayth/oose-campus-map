import LocationNode from "./LocationNode";

class SubPath {

    constructor(path) {
        this.locations = [];
        this.currIndex = 0;
        console.log(" subpath creation")

        path.forEach((point) => {
            let ln = new LocationNode(point);
            this.locations.push(ln);
            console.log("Pushing new locationNode: " + ln.getLatitude() + ", " + ln.getLongitude())
            // console.log(`    Latitude: ${point.latitude}`);
            // console.log(`    Longitude: ${point.longitude}`);
            // console.log(`    Floor: ${point.floor}`);
            // console.log(`    Building: ${point.building}`);
            // console.log(`    ID: ${point.id}`);
        });
        this.building = this.locations[0].getBuilding();
        this.floor = this.locations[0].getFloor();
    }

    hasNext() {
        return this.currIndex < this.locations.length;
    }

    getBuildingName() {
        return this.building;
    }

    getFloor() {
        return this.floor;
    }

    getNext() {
        if (this.hasNext()) {
            let n = this.locations[this.currIndex];
            this.currIndex++;
            return n;
        } else {
            return false;
        }

    }

    getStringRepresentation() {
        let s = "";
        this.locations.forEach((n) => {
            s += (n.getBuilding() + " FL" + n.getFloor() + " (" + n.getLatitude() + ", " + n.getLongitude() + ")\n");

        })

        return s;
    }
}

export default SubPath;