"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePinchCommons = void 0;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
var _clamp = require("../utils/clamp");
var _useVector = require("./useVector");
var _pinchTransform = require("../utils/pinchTransform");
const usePinchCommons = options => {
  const {
    container,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    scaleMode,
    pinchCenteringMode,
    allowPinchPanning,
    boundFn,
    userCallbacks
  } = options;
  const pinchClamp = pinchCenteringMode === 'clamp';
  const scaleClamp = scaleMode === 'clamp';
  const initialFocal = (0, _useVector.useVector)(0, 0);
  const currentFocal = (0, _useVector.useVector)(0, 0);
  const origin = (0, _useVector.useVector)(0, 0);

  // This value is used to trigger the onGestureEnd callback as a gimmick to avoid unneccesary calculations.
  const gestureEnd = (0, _reactNativeReanimated.useSharedValue)(0);
  const [gesturesEnabled, setGesturesEnabled] = (0, _react.useState)(true);
  const switchGesturesState = value => {
    if (scaleMode !== 'bounce') return;
    setGesturesEnabled(value);
  };
  const onTouchesDown = (e, state) => {
    'worklet';

    if (e.numberOfTouches === 2) {
      state.begin();
    }
  };
  const onTouchesUp = (e, state) => {
    'worklet';

    if (e.numberOfTouches !== 2) {
      state.end();
    }
  };
  const onTouchesMove = (e, state) => {
    'worklet';

    if (e.numberOfTouches !== 2) return;
    const touchOne = e.allTouches[0];
    const touchTwo = e.allTouches[1];
    currentFocal.x.value = (touchOne.absoluteX + touchTwo.absoluteX) / 2;
    currentFocal.y.value = (touchOne.absoluteY + touchTwo.absoluteY) / 2;
    state.activate();
  };
  const onPinchStart = e => {
    'worklet';

    (0, _reactNativeReanimated.runOnJS)(switchGesturesState)(false);
    userCallbacks.onPinchStart && (0, _reactNativeReanimated.runOnJS)(userCallbacks.onPinchStart)(e);
    (0, _reactNativeReanimated.cancelAnimation)(translate.x);
    (0, _reactNativeReanimated.cancelAnimation)(translate.y);
    (0, _reactNativeReanimated.cancelAnimation)(scale);
    initialFocal.x.value = currentFocal.x.value;
    initialFocal.y.value = currentFocal.y.value;
    origin.x.value = e.focalX - container.width.value / 2;
    origin.y.value = e.focalY - container.height.value / 2;
    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
    scaleOffset.value = scale.value;
  };
  const onPinchUpdate = e => {
    'worklet';

    let toScale = e.scale * scaleOffset.value;
    if (scaleClamp) toScale = (0, _clamp.clamp)(toScale, minScale, maxScale.value);
    const deltaX = currentFocal.x.value - initialFocal.x.value;
    const deltaY = currentFocal.y.value - initialFocal.y.value;
    const {
      x: toX,
      y: toY
    } = (0, _pinchTransform.pinchTransform)({
      toScale: toScale,
      fromScale: scaleOffset.value,
      origin: {
        x: origin.x.value,
        y: origin.y.value
      },
      offset: {
        x: offset.x.value,
        y: offset.y.value
      },
      delta: {
        x: allowPinchPanning ? deltaX : 0,
        y: allowPinchPanning ? deltaY : 0
      }
    });
    const {
      x: boundX,
      y: boundY
    } = boundFn(toScale);
    const clampedX = (0, _clamp.clamp)(toX, -1 * boundX, boundX);
    const clampedY = (0, _clamp.clamp)(toY, -1 * boundY, boundY);
    translate.x.value = pinchClamp ? clampedX : toX;
    translate.y.value = pinchClamp ? clampedY : toY;
    scale.value = toScale;
  };
  const reset = (toX, toY, toScale) => {
    'worklet';

    (0, _reactNativeReanimated.cancelAnimation)(translate.x);
    (0, _reactNativeReanimated.cancelAnimation)(translate.y);
    (0, _reactNativeReanimated.cancelAnimation)(scale);
    const areTXNotEqual = translate.x.value !== toX;
    const areTYNotEqual = translate.y.value !== toY;
    const areScalesNotEqual = scale.value !== toScale;
    const toValue = areTXNotEqual || areTYNotEqual || areScalesNotEqual ? 1 : 0;
    translate.x.value = (0, _reactNativeReanimated.withTiming)(toX);
    translate.y.value = (0, _reactNativeReanimated.withTiming)(toY);
    scale.value = (0, _reactNativeReanimated.withTiming)(toScale, undefined, finished => {
      scaleOffset.value = scale.value;
      finished && (0, _reactNativeReanimated.runOnJS)(switchGesturesState)(true);
    });
    gestureEnd.value = (0, _reactNativeReanimated.withTiming)(toValue, undefined, finished => {
      gestureEnd.value = 0;
      if (finished && userCallbacks.onGestureEnd !== undefined) {
        (0, _reactNativeReanimated.runOnJS)(userCallbacks.onGestureEnd)();
      }
    });
  };
  const onPinchEnd = e => {
    'worklet';

    userCallbacks.onPinchEnd && (0, _reactNativeReanimated.runOnJS)(userCallbacks.onPinchEnd)(e);
    const toScale = (0, _clamp.clamp)(scale.value, minScale, maxScale.value);
    const deltaY = !scaleClamp && allowPinchPanning && scale.value > maxScale.value ? (currentFocal.y.value - initialFocal.y.value) / 2 : 0;
    const {
      x,
      y
    } = (0, _pinchTransform.pinchTransform)({
      toScale: toScale,
      fromScale: scale.value,
      origin: {
        x: origin.x.value,
        y: origin.y.value
      },
      offset: {
        x: translate.x.value,
        y: translate.y.value
      },
      delta: {
        x: 0,
        y: deltaY
      }
    });
    const {
      x: boundX,
      y: boundY
    } = boundFn(toScale);
    const toX = (0, _clamp.clamp)(x, -1 * boundX, boundX);
    const toY = (0, _clamp.clamp)(y, -1 * boundY, boundY);
    reset(toX, toY, toScale);
  };
  return {
    gesturesEnabled,
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd
  };
};
exports.usePinchCommons = usePinchCommons;
//# sourceMappingURL=usePinchCommons.js.map