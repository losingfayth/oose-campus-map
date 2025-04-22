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

        pathData.forEach((segment) => {
            let subPath = new SubPath(segment);
            this.subPaths.push(subPath);

            if (Math.floor(subPath.getFloor()) == subPath.getFloor()) {
                let abbr = getBuildingAbbreviation(subPath.getBuildingName());
                if (!(abbr === "OUT")) {
                    abbr += subPath.getFloor();
                }
                this.blueprintNames.push(abbr);
            }
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
        while (this.hasNext()) {
            let n = this.getNext();
            s += n.getStringRepresentation() + "\n******\n";
        }
        return s;
    }

    getBlueprintNames() {
        // let blueprintNames = [];
        // for (let i = 0; i < this.subPaths.length; i++) {
        //     blueprintNames.push(getBuildingAbbreviation(this.subPaths[i].getBuildingName()) + this.subPaths[i].getFloor());
        // }
        // return blueprintNames;
        return this.blueprintNames;
    }

}

export default ProcessedPath;