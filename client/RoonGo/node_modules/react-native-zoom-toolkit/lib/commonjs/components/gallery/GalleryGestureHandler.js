"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _clamp = require("../../commons/utils/clamp");
var _useVector = require("../../commons/hooks/useVector");
var _snapPoint = require("../../commons/utils/snapPoint");
var _getVisibleRect = require("../../commons/utils/getVisibleRect");
var _usePinchCommons = require("../../commons/hooks/usePinchCommons");
var _useDoubleTapCommons = require("../../commons/hooks/useDoubleTapCommons");
var _getSwipeDirection = require("../../commons/utils/getSwipeDirection");
var _context = require("./context");
var _getScrollPosition = require("../../commons/utils/getScrollPosition");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const minScale = 1;
const config = {
  duration: 300,
  easing: _reactNativeReanimated.Easing.linear
};
/*
 * Pinchable views are really heavy components, therefore in order to maximize performance
 * only a single pinchable view is shared among all the list items, items listen to this
 * component updates and only update themselves if they are the current item.
 */
const GalleryGestureHandler = ({
  length,
  gap,
  maxScale,
  itemSize,
  vertical,
  tapOnEdgeToItem,
  zoomEnabled,
  scaleMode,
  allowOverflow,
  allowPinchPanning,
  pinchCenteringMode,
  onTap,
  onPanStart,
  onPanEnd,
  onPinchStart: onUserPinchStart,
  onPinchEnd: onUserPinchEnd,
  onSwipe: onUserSwipe,
  onVerticalPull,
  onGestureEnd
}) => {
  const {
    activeIndex,
    scroll,
    scrollOffset,
    isScrolling,
    rootSize,
    rootChildSize,
    translate,
    scale,
    overflow,
    hideAdjacentItems
  } = (0, _react.useContext)(_context.GalleryContext);
  const offset = (0, _useVector.useVector)(0, 0);
  const scaleOffset = (0, _reactNativeReanimated.useSharedValue)(1);
  const time = (0, _reactNativeReanimated.useSharedValue)(0);
  const position = (0, _useVector.useVector)(0, 0);
  const gestureEnd = (0, _reactNativeReanimated.useSharedValue)(0);
  const isPullingVertical = (0, _reactNativeReanimated.useSharedValue)(false);
  const pullReleased = (0, _reactNativeReanimated.useSharedValue)(false);
  const boundsFn = optionalScale => {
    'worklet';

    const scaleValue = optionalScale ?? scale.value;
    const {
      width: cWidth,
      height: cHeight
    } = rootChildSize;
    const {
      width: rWidth,
      height: rHeight
    } = rootSize;
    const boundX = Math.max(0, cWidth.value * scaleValue - rWidth.value) / 2;
    const boundY = Math.max(0, cHeight.value * scaleValue - rHeight.value) / 2;
    return {
      x: boundX,
      y: boundY
    };
  };
  const reset = (toX, toY, toScale, animate = true) => {
    'worklet';

    (0, _reactNativeReanimated.cancelAnimation)(translate.x);
    (0, _reactNativeReanimated.cancelAnimation)(translate.y);
    (0, _reactNativeReanimated.cancelAnimation)(scale);
    translate.x.value = animate ? (0, _reactNativeReanimated.withTiming)(toX) : toX;
    translate.y.value = animate ? (0, _reactNativeReanimated.withTiming)(toY) : toY;
    scale.value = animate ? (0, _reactNativeReanimated.withTiming)(toScale) : toScale;
    scaleOffset.value = toScale;
  };
  const snapToScrollPosition = e => {
    'worklet';

    (0, _reactNativeReanimated.cancelAnimation)(scroll);
    const prev = (0, _getScrollPosition.getScrollPosition)({
      index: (0, _clamp.clamp)(activeIndex.value - 1, 0, length - 1),
      itemSize: itemSize.value,
      gap
    });
    const current = (0, _getScrollPosition.getScrollPosition)({
      index: activeIndex.value,
      itemSize: itemSize.value,
      gap
    });
    const next = (0, _getScrollPosition.getScrollPosition)({
      index: (0, _clamp.clamp)(activeIndex.value + 1, 0, length - 1),
      itemSize: itemSize.value,
      gap
    });
    const velocity = vertical ? e.velocityY : e.velocityX;
    const toScroll = (0, _snapPoint.snapPoint)(scroll.value, velocity, [prev, current, next]);
    scroll.value = (0, _reactNativeReanimated.withTiming)(toScroll, config, finished => {
      if (!finished) return;
      if (toScroll !== current) {
        activeIndex.value += toScroll === next ? 1 : -1;
      }
      isScrolling.value = false;
      toScroll !== current && reset(0, 0, minScale, false);
    });
  };
  const onSwipe = direction => {
    'worklet';

    (0, _reactNativeReanimated.cancelAnimation)(scroll);
    let toIndex = activeIndex.value;
    if (direction === 'up' && vertical) toIndex += 1;
    if (direction === 'down' && vertical) toIndex -= 1;
    if (direction === 'left' && !vertical) toIndex += 1;
    if (direction === 'right' && !vertical) toIndex -= 1;
    toIndex = (0, _clamp.clamp)(toIndex, 0, length - 1);
    if (toIndex === activeIndex.value) {
      return;
    }
    const newScrollPosition = (0, _getScrollPosition.getScrollPosition)({
      index: toIndex,
      itemSize: itemSize.value,
      gap
    });
    scroll.value = (0, _reactNativeReanimated.withTiming)(newScrollPosition, config, finished => {
      if (!finished) return;
      activeIndex.value = toIndex;
      isScrolling.value = false;
      reset(0, 0, minScale, false);
    });
  };
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    translate: translate.y.value,
    isPulling: isPullingVertical.value,
    released: pullReleased.value
  }), val => {
    val.isPulling && (onVerticalPull === null || onVerticalPull === void 0 ? void 0 : onVerticalPull(val.translate, val.released));
  }, [translate, isPullingVertical, pullReleased]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    width: rootSize.width.value,
    height: rootSize.height.value
  }), () => reset(0, 0, minScale, false), [rootSize]);
  const onGestureEndWrapper = () => {
    overflow.value = 'hidden';
    hideAdjacentItems.value = false;
    onGestureEnd === null || onGestureEnd === void 0 || onGestureEnd();
  };
  const {
    gesturesEnabled,
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd
  } = (0, _usePinchCommons.usePinchCommons)({
    container: rootSize,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    scaleMode,
    allowPinchPanning,
    pinchCenteringMode,
    boundFn: boundsFn,
    userCallbacks: {
      onPinchStart: onUserPinchStart,
      onPinchEnd: onUserPinchEnd,
      onGestureEnd: onGestureEndWrapper
    }
  });
  const {
    onDoubleTapEnd
  } = (0, _useDoubleTapCommons.useDoubleTapCommons)({
    container: rootSize,
    translate,
    scale,
    minScale,
    maxScale,
    scaleOffset,
    boundsFn,
    onGestureEnd
  });
  const pinch = _reactNativeGestureHandler.Gesture.Pinch().withTestId('pinch').enabled(zoomEnabled).manualActivation(true).onTouchesDown(onTouchesDown).onTouchesMove(onTouchesMove).onTouchesUp(onTouchesUp).onStart(e => {
    if (allowOverflow) {
      overflow.value = 'visible';
      hideAdjacentItems.value = true;
    }
    onPinchStart(e);
  }).onUpdate(onPinchUpdate).onEnd(onPinchEnd);
  const pan = _reactNativeGestureHandler.Gesture.Pan().withTestId('pan').maxPointers(1).minVelocity(100).enabled(gesturesEnabled).onStart(e => {
    onPanStart && (0, _reactNativeReanimated.runOnJS)(onPanStart)(e);
    (0, _reactNativeReanimated.cancelAnimation)(translate.x);
    (0, _reactNativeReanimated.cancelAnimation)(translate.y);
    (0, _reactNativeReanimated.cancelAnimation)(scroll);
    const isVerticalPan = Math.abs(e.velocityY) > Math.abs(e.velocityX);
    isPullingVertical.value = isVerticalPan && scale.value === 1 && !vertical;
    isScrolling.value = true;
    time.value = performance.now();
    position.x.value = e.absoluteX;
    position.y.value = e.absoluteY;
    scrollOffset.value = scroll.value;
    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
  }).onUpdate(e => {
    if (isPullingVertical.value) {
      translate.y.value = e.translationY;
      return;
    }
    const toX = offset.x.value + e.translationX;
    const toY = offset.y.value + e.translationY;
    const {
      x: boundX,
      y: boundY
    } = boundsFn(scale.value);
    const exceedX = Math.max(0, Math.abs(toX) - boundX);
    const exceedY = Math.max(0, Math.abs(toY) - boundY);
    const scrollX = -1 * Math.sign(toX) * exceedX;
    const scrollY = -1 * Math.sign(toY) * exceedY;
    const to = scrollOffset.value + (vertical ? scrollY : scrollX);
    const items = length - 1;
    scroll.value = (0, _clamp.clamp)(to, 0, items * itemSize.value + items * gap);
    translate.x.value = (0, _clamp.clamp)(toX, -1 * boundX, boundX);
    translate.y.value = (0, _clamp.clamp)(toY, -1 * boundY, boundY);
  }).onEnd(e => {
    const bounds = boundsFn(scale.value);
    const direction = (0, _getSwipeDirection.getSwipeDirection)(e, {
      boundaries: bounds,
      time: time.value,
      position: {
        x: position.x.value,
        y: position.y.value
      },
      translate: {
        x: isPullingVertical.value ? 100 : translate.x.value,
        y: isPullingVertical.value ? 0 : translate.y.value
      }
    });
    direction !== undefined && onSwipe(direction);
    direction !== undefined && onUserSwipe && (0, _reactNativeReanimated.runOnJS)(onUserSwipe)(direction);
    if (isPullingVertical.value) {
      pullReleased.value = true;
      translate.y.value = (0, _reactNativeReanimated.withTiming)(0, undefined, finished => {
        isPullingVertical.value = !finished;
        pullReleased.value = !finished;
      });
      return;
    }
    const isSwipingH = direction === 'left' || direction === 'right';
    const isSwipingV = direction === 'up' || direction === 'down';
    const snapV = vertical && (direction === undefined || isSwipingH);
    const snapH = !vertical && (direction === undefined || isSwipingV);
    (snapV || snapH) && snapToScrollPosition(e);
    direction === undefined && onPanEnd && (0, _reactNativeReanimated.runOnJS)(onPanEnd)(e);
    const configX = {
      velocity: e.velocityX,
      clamp: [-bounds.x, bounds.x]
    };
    const configY = {
      velocity: e.velocityY,
      clamp: [-bounds.y, bounds.y]
    };
    const restX = Math.abs(Math.abs(translate.x.value) - bounds.x);
    const restY = Math.abs(Math.abs(translate.y.value) - bounds.y);
    const finalConfig = restX > restY ? configX : configY;
    gestureEnd.value = restX > restY ? translate.x.value : translate.y.value;
    gestureEnd.value = (0, _reactNativeReanimated.withDecay)(finalConfig, () => {
      onGestureEnd && (0, _reactNativeReanimated.runOnJS)(onGestureEnd)();
    });
    translate.x.value = (0, _reactNativeReanimated.withDecay)(configX);
    translate.y.value = (0, _reactNativeReanimated.withDecay)(configY);
  });
  const tap = _reactNativeGestureHandler.Gesture.Tap().withTestId('tap').enabled(gesturesEnabled).numberOfTaps(1).maxDuration(250).onEnd(event => {
    const gallerySize = {
      width: rootSize.width.value,
      height: rootSize.height.value
    };
    const rect = (0, _getVisibleRect.getVisibleRect)({
      scale: scale.value,
      containerSize: gallerySize,
      itemSize: gallerySize,
      translation: {
        x: translate.x.value,
        y: translate.y.value
      }
    });
    const tapEdge = 44 / scale.value;
    const leftEdge = rect.x + tapEdge;
    const rightEdge = rect.x + rect.width - tapEdge;
    let toIndex = activeIndex.value;
    const canGoToItem = tapOnEdgeToItem && !vertical;
    if (event.x <= leftEdge && canGoToItem) toIndex -= 1;
    if (event.x >= rightEdge && canGoToItem) toIndex += 1;
    toIndex = (0, _clamp.clamp)(toIndex, 0, length - 1);
    if (toIndex === activeIndex.value) {
      onTap && (0, _reactNativeReanimated.runOnJS)(onTap)(event, activeIndex.value);
      return;
    }
    const toScroll = (0, _getScrollPosition.getScrollPosition)({
      index: toIndex,
      itemSize: itemSize.value,
      gap
    });
    scroll.value = toScroll;
    activeIndex.value = toIndex;
    reset(0, 0, minScale, false);
  });
  const doubleTap = _reactNativeGestureHandler.Gesture.Tap().withTestId('doubleTap').enabled(gesturesEnabled && zoomEnabled).numberOfTaps(2).maxDuration(250).onEnd(onDoubleTapEnd);
  const detectorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const width = Math.max(rootSize.width.value, rootChildSize.width.value);
    const height = Math.max(rootSize.height.value, rootChildSize.height.value);
    return {
      width: width,
      height: height,
      position: 'absolute',
      zIndex: 2_147_483_647,
      transform: [{
        translateX: translate.x.value
      }, {
        translateY: translate.y.value
      }, {
        scale: scale.value
      }]
    };
  }, [rootSize, rootChildSize, translate, scale]);
  const composed = _reactNativeGestureHandler.Gesture.Race(pan, pinch, _reactNativeGestureHandler.Gesture.Exclusive(doubleTap, tap));
  return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: composed
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: detectorStyle
  }));
};
var _default = exports.default = /*#__PURE__*/_react.default.memo(GalleryGestureHandler, (prev, next) => {
  return prev.onTap === next.onTap && prev.onPanStart === next.onPanStart && prev.onPanEnd === next.onPanEnd && prev.onPinchStart === next.onPinchStart && prev.onPinchEnd === next.onPinchEnd && prev.onSwipe === next.onSwipe && prev.length === next.length && prev.vertical === next.vertical && prev.tapOnEdgeToItem === next.tapOnEdgeToItem && prev.zoomEnabled === next.zoomEnabled && prev.scaleMode === next.scaleMode && prev.allowPinchPanning === next.allowPinchPanning && prev.allowOverflow === next.allowOverflow && prev.pinchCenteringMode === next.pinchCenteringMode && prev.onVerticalPull === next.onVerticalPull;
});
//# sourceMappingURL=GalleryGestureHandler.js.map