// src/assets/imagePaths.js
import { Image } from "react-native";

const imagePaths = {
  "BFB-1": require("../../assets/build_images/BFB-1.png"),
  "BFB-2": require("../../assets/build_images/BFB-2.jpg"),
  OUT: require("../../assets/build_images/OUT.jpg"),
  "NAVY-1": require("../../assets/build_images/NAVY-1.jpg"),
  "NAVY-2": require("../../assets/build_images/NAVY-2.jpg"),
};

const buildingNames = ["BFB-1", "BFB-2"];
const buildingCorners = [
  [41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069],
  [41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069],
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
