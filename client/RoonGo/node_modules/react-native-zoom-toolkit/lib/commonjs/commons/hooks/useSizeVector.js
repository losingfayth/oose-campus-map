"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSizeVector = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
const useSizeVector = (x, y) => {
  const first = (0, _reactNativeReanimated.useSharedValue)(x);
  const second = (0, _reactNativeReanimated.useSharedValue)(y);
  return {
    width: first,
    height: second
  };
};
exports.useSizeVector = useSizeVector;
//# sourceMappingURL=useSizeVector.js.map