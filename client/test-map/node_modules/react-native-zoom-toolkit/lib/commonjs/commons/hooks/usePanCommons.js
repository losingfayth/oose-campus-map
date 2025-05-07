"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePanCommons = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
var _clamp = require("../utils/clamp");
var _useVector = require("./useVector");
var _friction = require("../utils/friction");
var _getSwipeDirection = require("../utils/getSwipeDirection");
const usePanCommons = options => {
  const {
    container,
    translate,
    offset,
    panMode,
    decay,
    boundFn,
    userCallbacks
  } = options;
  const {
    onSwipe,
    onGestureEnd,
    onOverPanning
  } = userCallbacks;
  const time = (0, _reactNativeReanimated.useSharedValue)(0);
  const position = (0, _useVector.useVector)(0, 0);
  const gestureEnd = (0, _reactNativeReanimated.useSharedValue)(0); // Gimmick value to trigger onGestureEnd callback
  const isWithinBoundX = (0, _reactNativeReanimated.useSharedValue)(true);
  const isWithinBoundY = (0, _reactNativeReanimated.useSharedValue)(true);
  const onPanStart = e => {
    'worklet';

    userCallbacks.onPanStart && (0, _reactNativeReanimated.runOnJS)(userCallbacks.onPanStart)(e);
    (0, _reactNativeReanimated.cancelAnimation)(translate.x);
    (0, _reactNativeReanimated.cancelAnimation)(translate.y);
    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
    time.value = performance.now();
    position.x.value = e.absoluteX;
    position.y.value = e.absoluteY;
  };
  const onPanChange = e => {
    'worklet';

    const toX = e.translationX + offset.x.value;
    const toY = e.translationY + offset.y.value;
    const {
      x: boundX,
      y: boundY
    } = boundFn();
    const exceedX = Math.max(0, Math.abs(toX) - boundX);
    const exceedY = Math.max(0, Math.abs(toY) - boundY);
    isWithinBoundX.value = exceedX === 0;
    isWithinBoundY.value = exceedY === 0;
    if ((exceedX > 0 || exceedY > 0) && onOverPanning) {
      const ex = Math.sign(toX) * exceedX;
      const ey = Math.sign(toY) * exceedY;
      onOverPanning(ex, ey);
    }

    // Simplify both free and clamp pan modes in one condition due to their similarity
    if (panMode !== 'friction') {
      const isFree = panMode === 'free';
      translate.x.value = isFree ? toX : (0, _clamp.clamp)(toX, -1 * boundX, boundX);
      translate.y.value = isFree ? toY : (0, _clamp.clamp)(toY, -1 * boundY, boundY);
      return;
    }
    const overScrollFraction = Math.max(container.width.value, container.height.value) * 1.5;
    if (isWithinBoundX.value) {
      translate.x.value = toX;
    } else {
      const fraction = Math.abs(Math.abs(toX) - boundX) / overScrollFraction;
      const frictionX = (0, _friction.friction)((0, _clamp.clamp)(fraction, 0, 1));
      translate.x.value += e.changeX * frictionX;
    }
    if (isWithinBoundY.value) {
      translate.y.value = toY;
    } else {
      const fraction = Math.abs(Math.abs(toY) - boundY) / overScrollFraction;
      const frictionY = (0, _friction.friction)((0, _clamp.clamp)(fraction, 0, 1));
      translate.y.value += e.changeY * frictionY;
    }
  };
  const onPanEnd = e => {
    'worklet';

    if (panMode === 'clamp' && onSwipe) {
      const boundaries = boundFn();
      const direction = (0, _getSwipeDirection.getSwipeDirection)(e, {
        boundaries,
        time: time.value,
        position: {
          x: position.x.value,
          y: position.y.value
        },
        translate: {
          x: translate.x.value,
          y: translate.y.value
        }
      });
      if (direction !== undefined) {
        (0, _reactNativeReanimated.runOnJS)(onSwipe)(direction);
        return;
      }
    }
    userCallbacks.onPanEnd && (0, _reactNativeReanimated.runOnJS)(userCallbacks.onPanEnd)(e);
    const {
      x: boundX,
      y: boundY
    } = boundFn();
    const clampX = [-1 * boundX, boundX];
    const clampY = [-1 * boundY, boundY];
    const toX = (0, _clamp.clamp)(translate.x.value, -1 * boundX, boundX);
    const toY = (0, _clamp.clamp)(translate.y.value, -1 * boundY, boundY);
    const decayX = decay && isWithinBoundX.value;
    const decayY = decay && isWithinBoundY.value;
    const decayConfigX = {
      velocity: e.velocityX,
      clamp: clampX
    };
    const decayConfigY = {
      velocity: e.velocityY,
      clamp: clampY
    };
    translate.x.value = decayX ? (0, _reactNativeReanimated.withDecay)(decayConfigX) : (0, _reactNativeReanimated.withTiming)(toX);
    translate.y.value = decayY ? (0, _reactNativeReanimated.withDecay)(decayConfigY) : (0, _reactNativeReanimated.withTiming)(toY);
    const restX = Math.abs(Math.abs(translate.x.value) - boundX);
    const restY = Math.abs(Math.abs(translate.y.value) - boundY);
    gestureEnd.value = restX > restY ? translate.x.value : translate.y.value;
    if (decayX || decayY) {
      const config = restX > restY ? decayConfigX : decayConfigY;
      gestureEnd.value = (0, _reactNativeReanimated.withDecay)(config, finished => {
        finished && onGestureEnd && (0, _reactNativeReanimated.runOnJS)(onGestureEnd)();
      });
    } else {
      const toValue = restX > restY ? toX : toY;
      gestureEnd.value = (0, _reactNativeReanimated.withTiming)(toValue, undefined, finished => {
        finished && onGestureEnd && (0, _reactNativeReanimated.runOnJS)(onGestureEnd)();
      });
    }
  };
  return {
    onPanStart,
    onPanChange,
    onPanEnd
  };
};
exports.usePanCommons = usePanCommons;
//# sourceMappingURL=usePanCommons.js.map