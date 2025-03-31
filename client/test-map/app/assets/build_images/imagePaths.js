// src/assets/imagePaths.js
import { Image } from "react-native";

const imagePaths = {
  "BFB-1": require("../../assets/build_images/BFB-1.jpg"),
  "BFB-2": require("../../assets/build_images/BFB-2.jpg"),
  OUT: require("../../assets/build_images/OUT.jpg"),
  "NAVY-1": require("../../assets/build_images/NAVY-1.jpg"),
  "NAVY-2": require("../../assets/build_images/NAVY-2.jpg"),
};

// Add width and height to each entry
Object.keys(imagePaths).forEach((key) => {
  const { width, height } = Image.resolveAssetSource(imagePaths[key]);
  imagePaths[key].width = width;
  imagePaths[key].height = height;
});

export default imagePaths;
