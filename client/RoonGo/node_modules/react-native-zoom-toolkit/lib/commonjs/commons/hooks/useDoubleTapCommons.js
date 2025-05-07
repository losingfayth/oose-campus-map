"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDoubleTapCommons = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
var _pinchTransform = require("../utils/pinchTransform");
var _clamp = require("../utils/clamp");
const useDoubleTapCommons = ({
  container,
  translate,
  scale,
  minScale,
  maxScale,
  scaleOffset,
  boundsFn,
  onGestureEnd
}) => {
  const onDoubleTapEnd = event => {
    'worklet';

    const originX = event.x - container.width.value / 2;
    const originY = event.y - container.height.value / 2;
    const toScale = scale.value >= maxScale.value * 0.8 ? minScale : maxScale.value;
    const {
      x,
      y
    } = (0, _pinchTransform.pinchTransform)({
      toScale: toScale,
      fromScale: scale.value,
      origin: {
        x: originX,
        y: originY
      },
      delta: {
        x: 0,
        y: 0
      },
      offset: {
        x: translate.x.value,
        y: translate.y.value
      }
    });
    const {
      x: boundX,
      y: boundY
    } = boundsFn(toScale);
    const toX = (0, _clamp.clamp)(x, -1 * boundX, boundX);
    const toY = (0, _clamp.clamp)(y, -1 * boundY, boundY);
    translate.x.value = (0, _reactNativeReanimated.withTiming)(toX);
    translate.y.value = (0, _reactNativeReanimated.withTiming)(toY);
    scaleOffset.value = toScale;
    scale.value = (0, _reactNativeReanimated.withTiming)(toScale, undefined, finished => {
      finished && onGestureEnd && (0, _reactNativeReanimated.runOnJS)(onGestureEnd)();
    });
  };
  return {
    onDoubleTapEnd
  };
};
exports.useDoubleTapCommons = useDoubleTapCommons;
//# sourceMappingURL=useDoubleTapCommons.js.map