"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.crop = void 0;
var _getVisibleRect = require("./getVisibleRect");
const crop = options => {
  'worklet';

  const {
    cropSize,
    itemSize,
    resolution,
    translation,
    scale,
    isRotated,
    fixedWidth
  } = options;
  const rect = (0, _getVisibleRect.getVisibleRect)({
    scale,
    containerSize: cropSize,
    itemSize: {
      width: isRotated ? itemSize.height : itemSize.width,
      height: isRotated ? itemSize.width : itemSize.height
    },
    translation
  });
  const relativeScale = resolution.width / itemSize.width;
  const x = rect.x * relativeScale;
  const y = rect.y * relativeScale;
  const width = rect.width * relativeScale;
  const height = rect.height * relativeScale;

  // Make a normal crop, if the fixedWidth is defined just resize everything to meet the ratio
  // between fixedWidth and the width of the crop.
  let sizeModifier = 1;
  let resize;
  if (fixedWidth !== undefined) {
    sizeModifier = fixedWidth / width;
    resize = {
      width: Math.ceil(resolution.width * sizeModifier),
      height: Math.ceil(resolution.height * sizeModifier)
    };
  }
  return {
    crop: {
      originX: x * sizeModifier,
      originY: y * sizeModifier,
      width: Math.floor(width * sizeModifier),
      height: Math.floor(height * sizeModifier)
    },
    resize
  };
};
exports.crop = crop;
//# sourceMappingURL=crop.js.map