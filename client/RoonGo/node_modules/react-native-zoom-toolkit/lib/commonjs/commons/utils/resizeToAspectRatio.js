"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resizeToAspectRatio = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
const resizeToAspectRatio = ({
  resizeConfig,
  width,
  height,
  scale
}) => {
  'worklet';

  let finalWidth = width;
  let finalHeight = height;
  if (resizeConfig !== undefined) {
    const {
      size,
      aspectRatio,
      scale: resizeScale
    } = resizeConfig;
    const isWide = aspectRatio > 1;
    finalWidth = isWide ? (0, _reactNativeReanimated.interpolate)(scale, [1, resizeScale], [size.width, size.height * aspectRatio], _reactNativeReanimated.Extrapolation.CLAMP) : size.width;
    finalHeight = isWide ? size.height : (0, _reactNativeReanimated.interpolate)(scale, [1, resizeScale], [size.height, size.width / aspectRatio], _reactNativeReanimated.Extrapolation.CLAMP);
  }
  const deltaX = (finalWidth - width) / 2;
  const deltaY = (finalHeight - height) / 2;
  return {
    width: finalWidth,
    height: finalHeight,
    deltaX,
    deltaY
  };
};
exports.resizeToAspectRatio = resizeToAspectRatio;
//# sourceMappingURL=resizeToAspectRatio.js.map