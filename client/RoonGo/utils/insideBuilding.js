import { buildingToReferencePoints, getBuildingName } from "./imagePaths.js";
import { CoordinateSystem } from "./CoordinateMap.js";

export function insideBuilding(GCS) {
    console.log("Inside Building GCS: ", GCS);

    var at = {
        x: GCS.latitude,
        y: GCS.longitude,
    }

    console.log("at: ", at.x, at.y);

    var subtract = (a, b) => {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        }
    }

    var toPoint = (referencePoint) => {
        return {
            x: referencePoint.latitude,
            y: referencePoint.longitude
        }
    }

    var multiply = (matrix, vector) => {
        return {
            x: matrix[0] * vector.x + matrix[1] * vector.y,
            y: matrix[2] * vector.x + matrix[3] * vector.y
        }
    }

    // console.log("Starting to check buildingsssss");
    // console.log("Building to Reference Points: ", buildingToReferencePoints["BF"].topLeft.latitude);
    // Iterate through each building and check if the point is inside
    // the building's reference points
    for (const [key, value] of Object.entries(buildingToReferencePoints)) {
        var topLeft = toPoint(value.topLeft);
        var topRight = toPoint(value.topRight);
        var bottomLeft = toPoint(value.bottomLeft);

        var coordinateSystem = CoordinateSystem(topLeft, topRight, bottomLeft);
        var wrtOrigin = subtract(at, coordinateSystem.origin);
        var m = multiply(coordinateSystem.inverseMatrix, wrtOrigin);
        if (m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1) {
            console.log("key: " + key);
            return getBuildingName(key);
        }
    }

    console.log("Outside");
    return "OUT";


}