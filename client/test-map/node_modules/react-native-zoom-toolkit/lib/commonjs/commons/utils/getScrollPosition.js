"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getScrollPosition = void 0;
const getScrollPosition = options => {
  'worklet';

  const {
    index,
    itemSize,
    gap
  } = options;
  return index * itemSize + index * gap;
};
exports.getScrollPosition = getScrollPosition;
//# sourceMappingURL=getScrollPosition.js.map