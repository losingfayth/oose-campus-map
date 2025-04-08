import { Image } from "react-native";
import imagePaths from "../assets/build_images/imagePaths";

class PointNormalizer {
  // Gets the width and height of an image
  static getImageSize(key) {
    return Image.resolveAssetSource(imagePaths[key]);
  }

  static normalizePoints(points, imageKey) {
    const imageInfo = this.getImageSize(imageKey);
    const imageWidth = imageInfo.width;
    const imageHeight = imageInfo.height;

    return points.map((point) => ({
      x: point.x / imageWidth,
      y: point.y / imageHeight,
    }));
  }
}

export default PointNormalizer;
