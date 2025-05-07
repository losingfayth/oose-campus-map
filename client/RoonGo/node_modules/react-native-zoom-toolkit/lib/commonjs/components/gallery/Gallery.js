"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _clamp = require("../../commons/utils/clamp");
var _getMaxScale = require("../../commons/utils/getMaxScale");
var _getScrollPosition = require("../../commons/utils/getScrollPosition");
var _GalleryGestureHandler = _interopRequireDefault(require("./GalleryGestureHandler"));
var _GalleryItem = _interopRequireDefault(require("./GalleryItem"));
var _context = require("./context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Gallery = props => {
  const {
    reference,
    data,
    renderItem,
    keyExtractor,
    initialIndex = 0,
    windowSize = 5,
    maxScale: userMaxScale = 6,
    vertical = false,
    gap = 0,
    allowOverflow = false,
    tapOnEdgeToItem = true,
    zoomEnabled = true,
    scaleMode = 'bounce',
    pinchCenteringMode = 'clamp',
    allowPinchPanning = true,
    customTransition,
    onIndexChange,
    onScroll,
    onTap,
    onUpdate,
    onPanStart,
    onPanEnd,
    onPinchStart,
    onPinchEnd,
    onSwipe,
    onZoomBegin,
    onZoomEnd,
    onVerticalPull,
    onGestureEnd
  } = props;
  const {
    activeIndex,
    rootSize,
    rootChildSize,
    scroll,
    translate,
    scale,
    hasZoomed,
    overflow
  } = (0, _react.useContext)(_context.GalleryContext);
  const nextItems = Math.floor(windowSize / 2);
  const [scrollIndex, setScrollIndex] = (0, _react.useState)(initialIndex);
  const itemSize = (0, _reactNativeReanimated.useDerivedValue)(() => {
    return vertical ? rootSize.height.value : rootSize.width.value;
  }, [vertical, rootSize]);
  const maxScale = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (typeof userMaxScale === 'object') {
      if (userMaxScale.length === 0) return 6;
      return (0, _getMaxScale.getMaxScale)({
        width: rootChildSize.width.value,
        height: rootChildSize.height.value
      }, userMaxScale[activeIndex.value]);
    }
    return userMaxScale;
  }, [userMaxScale, activeIndex, rootChildSize]);
  const measureRoot = e => {
    const {
      width,
      height
    } = e.nativeEvent.layout;
    const scrollPosition = (0, _getScrollPosition.getScrollPosition)({
      index: activeIndex.get(),
      itemSize: vertical ? height : width,
      gap
    });
    rootSize.width.set(width);
    rootSize.height.set(height);
    scroll.set(scrollPosition);
  };
  const animatedStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: overflow.value
  }), [overflow]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    scroll: scroll.value,
    itemSize: itemSize.value
  }), value => onScroll === null || onScroll === void 0 ? void 0 : onScroll(value.scroll, (data.length - 1) * value.itemSize), [scroll, itemSize]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    width: rootChildSize.width.value,
    height: rootChildSize.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value
  }), state => onUpdate && onUpdate(state), [rootChildSize, translate, scale]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => activeIndex.value, value => {
    onIndexChange && (0, _reactNativeReanimated.runOnJS)(onIndexChange)(value);
    (0, _reactNativeReanimated.runOnJS)(setScrollIndex)(value);
  }, [activeIndex]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    vertical,
    size: {
      width: rootSize.width.value,
      height: rootSize.height.value
    }
  }), value => {
    scroll.value = (0, _getScrollPosition.getScrollPosition)({
      index: activeIndex.value,
      itemSize: value.vertical ? value.size.height : value.size.width,
      gap
    });
  }, [vertical, rootSize]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => scale.value, (value, previousValue) => {
    if (value !== 1 && !hasZoomed.value) {
      hasZoomed.value = true;
      onZoomBegin && (0, _reactNativeReanimated.runOnJS)(onZoomBegin)(activeIndex.value);
    } else if (value === 1 && previousValue !== 1 && hasZoomed.value) {
      hasZoomed.value = false;
      onZoomEnd && (0, _reactNativeReanimated.runOnJS)(onZoomEnd)(activeIndex.value);
    }
  }, [scale]);

  // Reference handling
  const setIndex = index => {
    const clamped = (0, _clamp.clamp)(index, 0, data.length - 1);
    activeIndex.value = clamped;
    scroll.value = (0, _getScrollPosition.getScrollPosition)({
      index: activeIndex.get(),
      itemSize: itemSize.get(),
      gap
    });
  };
  const requestState = () => ({
    width: rootChildSize.width.get(),
    height: rootChildSize.height.get(),
    translateX: translate.x.get(),
    translateY: translate.y.get(),
    scale: scale.get()
  });
  const reset = (animate = true) => {
    translate.x.value = animate ? (0, _reactNativeReanimated.withTiming)(0) : 0;
    translate.y.value = animate ? (0, _reactNativeReanimated.withTiming)(0) : 0;
    scale.value = animate ? (0, _reactNativeReanimated.withTiming)(1) : 1;
  };
  (0, _react.useImperativeHandle)(reference, () => ({
    setIndex,
    reset,
    requestState
  }));
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    testID: 'root',
    style: animatedStyles,
    onLayout: measureRoot
  }, data.map((item, index) => {
    const inLowerHalf = index < scrollIndex - nextItems;
    const inUpperHalf = index > scrollIndex + nextItems;
    if (inLowerHalf || inUpperHalf) return null;
    const key = (keyExtractor === null || keyExtractor === void 0 ? void 0 : keyExtractor(item, index)) ?? `item-${index}`;
    return /*#__PURE__*/_react.default.createElement(_GalleryItem.default, {
      key: key,
      zIndex: data.length - index,
      index: index,
      gap: gap,
      item: item,
      vertical: vertical,
      renderItem: renderItem,
      customTransition: customTransition
    });
  }), /*#__PURE__*/_react.default.createElement(_GalleryGestureHandler.default, {
    gap: gap,
    maxScale: maxScale,
    itemSize: itemSize,
    length: data.length,
    vertical: vertical,
    tapOnEdgeToItem: tapOnEdgeToItem,
    zoomEnabled: zoomEnabled,
    scaleMode: scaleMode,
    allowOverflow: allowOverflow,
    allowPinchPanning: allowPinchPanning,
    pinchCenteringMode: pinchCenteringMode,
    onTap: onTap,
    onPanStart: onPanStart,
    onPanEnd: onPanEnd,
    onPinchStart: onPinchStart,
    onPinchEnd: onPinchEnd,
    onSwipe: onSwipe,
    onVerticalPull: onVerticalPull,
    onGestureEnd: onGestureEnd
  }));
};
var _default = exports.default = Gallery;
//# sourceMappingURL=Gallery.js.map