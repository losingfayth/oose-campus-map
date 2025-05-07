import { getBuildingAbbreviation } from "../utils/imagePaths";
import LocationNode from "./LocationNode";
import SubPath from "./SubPath";

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
        this.areaIndex = 0;
        this.pathData = pathData;
        this.subPaths = [];
        this.blueprintNames = [];
        this.points = [];

        let spi = 0;



        pathData.forEach((segment) => {
            console.log("Creating subpath: ")
            let subPath = new SubPath(segment);
            this.subPaths.push(subPath);

            let abbr = getBuildingAbbreviation(subPath.getBuildingName());
            if (!(abbr === "OUT")) {
                abbr += "-" + Math.floor(subPath.getFloor());
            }
            this.blueprintNames.push(abbr);

            let subPathPoints = [];
            subPath.locations.forEach((location) => {
                subPathPoints.push({
                    latitude: location.getLatitude(),
                    longitude: location.getLongitude(),
                })
            })
            this.points.push(subPathPoints);

        });

        // for (let i = 0; i < pathData.length; i++) {
        //     let 
        // }

        this.numSubPaths = this.subPaths.length;
    }

    hasNext() {
        return this.areaIndex < this.subPaths.length;
    }

    getNext() {
        if (this.hasNext()) {
            let next = this.subPaths[this.areaIndex];
            this.areaIndex++;
            return next;
        } else {
            return false;
        }
    }

    getStringRepresentation() {
        let s = "";
        this.subPaths.forEach((sp) => {
            s += sp.getStringRepresentation();
        })

        return s;
    }

    getBlueprintNames() {

        return this.blueprintNames;
    }

    getPoints() {
        return this.points;
    }

}

export default ProcessedPath;