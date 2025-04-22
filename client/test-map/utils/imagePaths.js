// src/assets/imagePaths.js
import { Image } from "react-native";

var buildingNames = [
  ["Ben Franklin Hall", "BFB"],
  ["Navy Hall", "NAVY"],
  ["Bakeless Center for Humanities", "BCH"],
  ["Centennial Hall", "CEH"],
  ["Sutliff Hall", "SUT"],
  ["Warren Student Services Center", "SSC"],
  ["Andruss Library", "AL"],
  ["Arts & Administration Building", "A&A"],
  ["Hartline Science Center", "HSC"]
]

const buildingToAbbreviationMap = new Map();

buildingNames.forEach((pair) => {
  buildingToAbbreviationMap.put(pair[0], pair[1]);
});

const buildingToReferencePoints = {
  "BF": ReferencePoints([41.006674, -76.44827, 41.007064, -76.44857, 41.006764, -76.448069]),
  "HSC": ReferencePoints([41.007292, -76.448117, 41.007633, -76.447336, 41.006672, -76.447640]),
  "SSC": ReferencePoints([41.007807, -76.448380, 41.008093, -76.447748, 41.007448, -76.448098]),
  "BCH": ReferencePoints([41.008415, -76.448675, 41.008679, -76.448106, 41.007995, -76.448338]),
  "NAVY": ReferencePoints([41.007673, -76.449043, 41.008044, -76.449326, 41.007794, -76.448855]),
  "SUT": ReferencePoints([41.007749, -76.446363, 41.007440, -76.447036, 41.008018, -76.446582]),
  "CEH": ReferencePoints([41.008130, -76.446546, 41.008381, -76.445977, 41.007551, -76.446109]),
  "AL": ReferencePoints([41.009192, -76.445625, 41.009515, -76.444912, 41.008828, -76.445337]),
  "A&A": ReferencePoints([41.007940, -76.447597, 41.008159, -76.447243, 41.007620, -76.447317]),
  "OUT": ReferencePoints([1, -1, 1, -1, 1, -1]),
}

const blueprintImageData = {
  "OUT": {
    image: require("../assets/build_images/OUT.jpg"),
    reference: buildingToReferencePoints["OUT"],
  },
  "BFB-0": {
    image: require("../assets/build_images/Ben Franklin/BFB-GR.png"),
    reference: buildingToReferencePoints["BF"],
  },
  "BFB-1": {
    image: require("../assets/build_images/Ben Franklin/BFB-1.png"),
    reference: buildingToReferencePoints["BF"],
  },
  "BFB-2": {
    image: require("../assets/build_images/Ben Franklin/BFB-2.png"),
    reference: buildingToReferencePoints["BF"],
  },
  "NAVY-3": {
    image: require("../assets/build_images/Navy Hall/ATTIC.png"),
    reference: buildingToReferencePoints["NAVY"],
  },
  "NAVY-0": {
    image: require("../assets/build_images/Navy Hall/GR FL.png"),
    reference: buildingToReferencePoints["NAVY"],
  },
  "NAVY-1": {
    image: require("../assets/build_images/Navy Hall/1ST FL.png"),
    reference: buildingToReferencePoints["NAVY"],
  },
  "NAVY-2": {
    image: require("../assets/build_images/Navy Hall/2ND FL.png"),
    reference: buildingToReferencePoints["NAVY"],
  },
  "AL-1": {
    image: require("../assets/build_images/Andruss Library/AL-1.png"),
    reference: buildingToReferencePoints["AL"],
  },
  "AL-2": {
    image: require("../assets/build_images/Andruss Library/AL-2.png"),
    reference: buildingToReferencePoints["AL"],
  },
  "AL-3": {
    image: require("../assets/build_images/Andruss Library/AL-3.png"),
    reference: buildingToReferencePoints["AL"],
  },
  "AL-4": {
    image: require("../assets/build_images/Andruss Library/AL-4.png"),
    reference: buildingToReferencePoints["AL"],
  },
  "A&A-1": {
    image: require("../assets/build_images/Arts & Admin/A&A - 1.png"),
    reference: buildingToReferencePoints["A&A"],
  },
  "A&A-2": {
    image: require("../assets/build_images/Arts & Admin/A&A - 2.png"),
    reference: buildingToReferencePoints["A&A"],
  },
  "A&A-3": {
    image: require("../assets/build_images/Arts & Admin/A&A - 3.png"),
    reference: buildingToReferencePoints["A&A"],
  },
  "A&A-4": {
    image: require("../assets/build_images/Arts & Admin/A&A - 4.png"),
    reference: buildingToReferencePoints["A&A"],
  },
  "A&A-0": {
    image: require("../assets/build_images/Arts & Admin/A&A - G.png"),
    reference: buildingToReferencePoints["A&A"],
  },
  "BCH-1": {
    image: require("../assets/build_images/Bakeless/BCH-1.png"),
    reference: buildingToReferencePoints["BCH"],
  },
  "BCH-2": {
    image: require("../assets/build_images/Bakeless/BCH-2.png"),
    reference: buildingToReferencePoints["BCH"],
  },
  "BCH-3": {
    image: require("../assets/build_images/Bakeless/BCH-3.png"),
    reference: buildingToReferencePoints["BCH"],
  },
  "BCH-0": {
    image: require("../assets/build_images/Bakeless/BCH-G.png"),
    reference: buildingToReferencePoints["BCH"],
  },
  "CEH-1": {
    image: require("../assets/build_images/Centennial Hall/CEH-1.png"),
    reference: buildingToReferencePoints["CEH"],
  },
  "CEH-2": {
    image: require("../assets/build_images/Centennial Hall/CEH-2.png"),
    reference: buildingToReferencePoints["CEH"],
  },
  "CEH-3": {
    image: require("../assets/build_images/Centennial Hall/CEH-3.png"),
    reference: buildingToReferencePoints["CEH"],
  },
  "CEH-B": {
    image: require("../assets/build_images/Centennial Hall/CEH-B.png"),
    reference: buildingToReferencePoints["CEH"],
  },
  "HSC--1": {
    image: require("../assets/build_images/Hartline Science Center/HSC-B.png"),
    reference: buildingToReferencePoints["HSC"],
  },
  "HSC-1": {
    image: require("../assets/build_images/Hartline Science Center/HSC-1.png"),
    reference: buildingToReferencePoints["HSC"],
  },
  "HSC-2": {
    image: require("../assets/build_images/Hartline Science Center/HSC-2.png"),
    reference: buildingToReferencePoints["HSC"],
  },
  "HSC-0": {
    image: require("../assets/build_images/Hartline Science Center/HSC-G.png"),
    reference: buildingToReferencePoints["HSC"],
  },
  "SSC-1": {
    image: require("../assets/build_images/Student Services/1ST FL.png"),
    reference: buildingToReferencePoints["SSC"],
  },
  "SSC-2": {
    image: require("../assets/build_images/Student Services/2ND FL.png"),
    reference: buildingToReferencePoints["SSC"],
  },
  "SSC-0": {
    image: require("../assets/build_images/Student Services/GR FL.png"),
    reference: buildingToReferencePoints["SSC"],
  },
  "SUT-1": {
    image: require("../assets/build_images/Sutliff Hall/SH-1ST.png"),
    reference: buildingToReferencePoints["SUT"],
  },
  "SUT-2": {
    image: require("../assets/build_images/Sutliff Hall/SH-2ND.png"),
    reference: buildingToReferencePoints["SUT"],
  },
  "SUT-3": {
    image: require("../assets/build_images/Sutliff Hall/SH-3RD.png"),
    reference: buildingToReferencePoints["SUT"],
  },
};


const blueprintNames = [
  "OUT",
  "BFB-G",
  "BFB-1",
  "BFB-2",
  "NAVY-G",
  "NAVY-1",
  "NAVY-2",
  "NAVY-A",
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
  for (let i = 0; i < blueprintNames.length; i++) {
    arr.push(
      ImageReference(blueprintNames[i], ReferencePoints(buildingCorners[i]))
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
Object.keys(blueprintImageData).forEach((key) => {
  const { width, height } = Image.resolveAssetSource(blueprintImageData[key]);
  blueprintImageData[key].width = width;
  blueprintImageData[key].height = height;
});

export default blueprintImageData;
export {
  ImageReferences,
  buildingCorners,
  getImageReferences,
  getImageReference,
};
