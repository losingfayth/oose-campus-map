"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMaxScale = void 0;
const getMaxScale = (canvasSize, resolution) => {
  'worklet';

  if (resolution.width > resolution.height) {
    return Math.max(1, resolution.width / canvasSize.width);
  }
  return Math.max(1, resolution.height / canvasSize.height);
};
exports.getMaxScale = getMaxScale;
//# sourceMappingURL=getMaxScale.js.map