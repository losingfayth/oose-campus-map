"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useVector = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
const useVector = (x, y) => {
  const first = (0, _reactNativeReanimated.useSharedValue)(x);
  const second = (0, _reactNativeReanimated.useSharedValue)(y);
  return {
    x: first,
    y: second
  };
};
exports.useVector = useVector;
//# sourceMappingURL=useVector.js.map