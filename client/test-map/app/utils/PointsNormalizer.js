import { Image } from "react-native";
import imagePaths from "../assets/build_images/imagePaths";

class PointNormalizer {
  // Gets the width and height of an image
  static getImageSize(key) {
    return Image.resolveAssetSource(imagePaths[key]);
  }

  static normalizePoints(points, imageKey) {
    const imageWidth = imageKey.width;
    const imageHeight = imageKey.height;

    return points.map((point) => ({
      x: point.x / imageWidth,
      y: point.y / imageHeight,
    }));
  }
}

export default PointNormalizer;
