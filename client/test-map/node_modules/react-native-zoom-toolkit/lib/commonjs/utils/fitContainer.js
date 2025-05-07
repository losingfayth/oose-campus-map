"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fitContainer = void 0;
const fitContainer = (aspectRatio, container) => {
  'worklet';

  let width = container.width;
  let height = container.width / aspectRatio;
  if (height > container.height) {
    width = container.height * aspectRatio;
    height = container.height;
  }
  return {
    width,
    height
  };
};
exports.fitContainer = fitContainer;
//# sourceMappingURL=fitContainer.js.map