import LocationNode from "./LocationNode";

class SubPath {

    constructor(path) {
        this.locations = [];
        this.currIndex = 0;
        path.forEach((point) => {
            this.locations.push(new LocationNode(point));
            // console.log(`    Latitude: ${point.latitude}`);
            // console.log(`    Longitude: ${point.longitude}`);
            // console.log(`    Floor: ${point.floor}`);
            // console.log(`    Building: ${point.building}`);
            // console.log(`    ID: ${point.id}`);
        });
    }

    hasNext() {
        return this.currIndex < this.locations.length;
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
        while (this.hasNext()) {
            let n = this.getNext();
            s += (n.getBuilding() + " FL" + n.getFloor() + " (" + n.getLatitude() + ", " + n.getLongitude() + ")\n");
        }
        return s;
    }
}

export default SubPath;