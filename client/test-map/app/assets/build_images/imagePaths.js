// src/assets/imagePaths.js
import { Image } from "react-native";




const buildingNames = [
  "OUT",
  "BFB-G",
  "BFB-1",
  "BFB-2",
  "NAVY-G",
  "NAVY-1",
  "NAVY-2",
  "NAVY-A",
];
const buildingCorners = [
  [1.0, -1.0, 1.0, -1.0, 1.0, -1.0], // OUTSIDE (OUT)

  [41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069], // BFB-G
  [41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069], // BFB-1
  [41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069], // BFB-2

  [41.007673, -76.449043, 41.008044, -76.449326, 41.007794, -76.448855], // NAVY-G  edit
  [41.007673, -76.449043, 41.008044, -76.449326, 41.007794, -76.448855], // NAVY-1  edit
  [41.007673, -76.449043, 41.008044, -76.449326, 41.007794, -76.448855], // NAVY-2  edit
  [41.007673, -76.449043, 41.008044, -76.449326, 41.007794, -76.448855], // NAVY-A  edit

];

var ImageReferences = [];

const getImageReferences = function () {
  if (ImageReferences == null || ImageReferences.length == 0) {
    ImageReferences = loadImageReferences();
  }
  return ImageReferences;
};

const getImageReference = function (building) {
  ImageReferences = getImageReferences();

  for (let i = 0; i < ImageReferences.length; i++) {
    if (ImageReferences[i].building == building) {
      return ImageReferences[i];
    }
  }
  console.log("Unable to find reference points for building " + building);
};

function loadImageReferences() {
  let arr = [];
  for (let i = 0; i < buildingNames.length; i++) {
    arr.push(
      ImageReference(buildingNames[i], ReferencePoints(buildingCorners[i]))
    );
  }

  return arr;
}

function GmcCoordinate(latitude, longitude) {
  return {
    latitude: latitude,
    longitude: longitude,
  };
}

function ReferencePoints(pointsArr) {
  return {
    topLeft: GmcCoordinate(pointsArr[0], pointsArr[1]),
    topRight: GmcCoordinate(pointsArr[2], pointsArr[3]),
    bottomLeft: GmcCoordinate(pointsArr[4], pointsArr[5]),
  };
}

function ImageReference(building, referencePoints) {
  return {
    building: building,
    referencePoints: referencePoints,
  };
}

// Add width and height to each entry
Object.keys(imagePaths).forEach((key) => {
  const { width, height } = Image.resolveAssetSource(imagePaths[key]);
  imagePaths[key].width = width;
  imagePaths[key].height = height;
});

export default imagePaths;
export {
  ImageReferences,
  buildingCorners,
  getImageReferences,
  getImageReference,
};
