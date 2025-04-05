// src/assets/imagePaths.js
import { Image } from "react-native";

export const imagePaths = {
  "BFB-1": require("../../assets/build_images/BFB-1.jpg"),
  "BFB-2": require("../../assets/build_images/BFB-2.jpg"),
  OUT: require("../../assets/build_images/OUT.jpg"),
  "NAVY-1": require("../../assets/build_images/NAVY-1.jpg"),
  "NAVY-2": require("../../assets/build_images/NAVY-2.jpg"),
};


let buildingNames = ["BFB-1", "BFB-2", "NAVY-1"];
let GCSCoords = [];
GCSCoords.push(
  [41.006674, -76.44827],
  [41.007064, -76.44857],
  [41.006764, -76.448069], // BFB-1
  [41.006674, -76.44827],
  [41.007064, -76.44857],
  [41.006764, -76.448069] // BFB-2
);

for (let i = 0; i < twoDArray.length; i++) {
  imageReferencePoints.push(
    buildingNames[i],
    referencePoints(
      referencePoint(twoDArray[i][0].latitude, twoDArray[i][0].longitude)
    )
  );
}

export const imageReferencePoints = [];

for (let i = 0; i < buildingNames.length; i += 3) {
  imageReferencePoints.push(
    imageReference(
      buildingNames[i],
      referencePoints(
        referencePoint(GCSCoords[i][0], GCSCoords[i][1]),
        referencePoint(GCSCoords[i + 1][0], GCSCoords[i + 1][1]),
        referencePoint(GCSCoords[i + 2][0], GCSCoords[i + 2][1])
      )
    )
  );
}

function imageReference(buildingName, referencePoints) {
  return {
    buildingName: buildingName,
    referencePoints: referencePoints,
  };
}

function referencePoints(topLeft, topRight, bottomLeft) {
  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomLeft: bottomLeft,
  };
}

function referencePoint(lat, lng) {
  return {
    latitude: lat,
    longitude: lng,
  };
}

// Add width and height to each entry
Object.keys(imagePaths).forEach((key) => {
  const { width, height } = Image.resolveAssetSource(imagePaths[key]);
  imagePaths[key].width = width;
  imagePaths[key].height = height;
});

// export imagePaths, imageReferencePoints;
