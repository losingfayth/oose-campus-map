"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _useVector = require("../../commons/hooks/useVector");
var _useSizeVector = require("../../commons/hooks/useSizeVector");
var _resizeToAspectRatio = require("../../commons/utils/resizeToAspectRatio");
var _withSnapbackValidation = _interopRequireDefault(require("../../commons/hoc/withSnapbackValidation"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const DEFAULT_HITSLOP = {
  vertical: 0,
  horizontal: 0
};
const SnapbackZoom = ({
  children,
  hitSlop = DEFAULT_HITSLOP,
  resizeConfig,
  timingConfig,
  gesturesEnabled = true,
  scrollRef,
  onTap,
  onDoubleTap,
  onPinchStart,
  onPinchEnd,
  onUpdate,
  onGestureEnd
}) => {
  const containerRef = (0, _reactNativeReanimated.useAnimatedRef)();
  const translate = (0, _useVector.useVector)(0, 0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const position = (0, _useVector.useVector)(0, 0);
  const origin = (0, _useVector.useVector)(0, 0);
  const initialFocal = (0, _useVector.useVector)(0, 0);
  const currentFocal = (0, _useVector.useVector)(0, 0);
  const containerSize = (0, _useSizeVector.useSizeVector)((resizeConfig === null || resizeConfig === void 0 ? void 0 : resizeConfig.size.width) ?? 0, (resizeConfig === null || resizeConfig === void 0 ? void 0 : resizeConfig.size.height) ?? 0);
  const measureContainer = () => {
    'worklet';

    const measuremet = (0, _reactNativeReanimated.measure)(containerRef);
    if (measuremet !== null) {
      containerSize.width.value = measuremet.width;
      containerSize.height.value = measuremet.height;
      position.x.value = measuremet.pageX;
      position.y.value = measuremet.pageY;
    }
  };
  const childrenSize = (0, _reactNativeReanimated.useDerivedValue)(() => {
    return (0, _resizeToAspectRatio.resizeToAspectRatio)({
      resizeConfig,
      width: containerSize.width.value,
      height: containerSize.height.value,
      scale: scale.value
    });
  }, [resizeConfig, containerSize, scale]);
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    const {
      width,
      height
    } = childrenSize.value;
    onUpdate === null || onUpdate === void 0 || onUpdate({
      x: position.x.value,
      y: position.y.value,
      width: containerSize.width.value,
      height: containerSize.height.value,
      resizedWidth: resizeConfig ? width : undefined,
      resizedHeight: resizeConfig ? height : undefined,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value
    });
  }, [childrenSize, position, containerSize, resizeConfig, translate, scale]);
  const pinch = _reactNativeGestureHandler.Gesture.Pinch().withTestId('pinch').hitSlop(hitSlop).enabled(gesturesEnabled).onTouchesMove(e => {
    if (e.numberOfTouches !== 2) return;
    const one = e.allTouches[0];
    const two = e.allTouches[1];
    currentFocal.x.value = (one.absoluteX + two.absoluteX) / 2;
    currentFocal.y.value = (one.absoluteY + two.absoluteY) / 2;
  }).onStart(e => {
    measureContainer();
    onPinchStart && onPinchStart(e);
    initialFocal.x.value = currentFocal.x.value;
    initialFocal.y.value = currentFocal.y.value;
    origin.x.value = e.focalX - containerSize.width.value / 2;
    origin.y.value = e.focalY - containerSize.height.value / 2;
  }).onUpdate(e => {
    measureContainer();
    const deltaX = currentFocal.x.value - initialFocal.x.value;
    const deltaY = currentFocal.y.value - initialFocal.y.value;
    const toX = -1 * (origin.x.value * e.scale - origin.x.value) + deltaX;
    const toY = -1 * (origin.y.value * e.scale - origin.y.value) + deltaY;
    translate.x.value = toX;
    translate.y.value = toY;
    scale.value = e.scale;
  }).onEnd(e => {
    onPinchEnd && (0, _reactNativeReanimated.runOnJS)(onPinchEnd)(e);
    translate.x.value = (0, _reactNativeReanimated.withTiming)(0, timingConfig);
    translate.y.value = (0, _reactNativeReanimated.withTiming)(0, timingConfig);
    scale.value = (0, _reactNativeReanimated.withTiming)(1, timingConfig, _ => {
      onGestureEnd && (0, _reactNativeReanimated.runOnJS)(onGestureEnd)();
    });
  });
  if (scrollRef !== undefined) {
    pinch.blocksExternalGesture(scrollRef);
  }
  const tap = _reactNativeGestureHandler.Gesture.Tap().withTestId('tap').enabled(gesturesEnabled).maxDuration(250).numberOfTaps(1).runOnJS(true).onEnd(e => onTap === null || onTap === void 0 ? void 0 : onTap(e));
  const doubleTap = _reactNativeGestureHandler.Gesture.Tap().withTestId('doubleTap').enabled(gesturesEnabled).numberOfTaps(2).maxDuration(250).runOnJS(true).onEnd(e => onDoubleTap === null || onDoubleTap === void 0 ? void 0 : onDoubleTap(e));
  const containerStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    width: resizeConfig === null || resizeConfig === void 0 ? void 0 : resizeConfig.size.width,
    height: resizeConfig === null || resizeConfig === void 0 ? void 0 : resizeConfig.size.height,
    justifyContent: 'center',
    alignItems: 'center'
  }), [resizeConfig]);
  const childStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const {
      width,
      height,
      deltaX,
      deltaY
    } = childrenSize.value;
    return {
      width: width === 0 ? undefined : width,
      height: height === 0 ? undefined : height,
      transform: [{
        translateX: translate.x.value - deltaX
      }, {
        translateY: translate.y.value - deltaY
      }, {
        scale: scale.value
      }]
    };
  }, [childrenSize, translate, scale]);
  const composedTapGesture = _reactNativeGestureHandler.Gesture.Exclusive(doubleTap, tap);
  return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: _reactNativeGestureHandler.Gesture.Race(pinch, composedTapGesture)
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: containerStyle,
    ref: containerRef
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: childStyle
  }, children)));
};
var _default = exports.default = (0, _withSnapbackValidation.default)(SnapbackZoom);
//# sourceMappingURL=SnapbackZoom.js.map