"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = require("react-native-reanimated");
var _clamp = require("../../commons/utils/clamp");
var _useVector = require("../../commons/hooks/useVector");
var _useSizeVector = require("../../commons/hooks/useSizeVector");
var _Gallery = _interopRequireDefault(require("./Gallery"));
var _context = require("./context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const GalleryProvider = (props, ref) => {
  const startIndex = (0, _clamp.clamp)(props.initialIndex ?? 0, 0, props.data.length - 1);
  const activeIndex = (0, _reactNativeReanimated.useSharedValue)(startIndex);
  const rootSize = (0, _useSizeVector.useSizeVector)(0, 0);
  const rootChildSize = (0, _useSizeVector.useSizeVector)(0, 0);
  const translate = (0, _useVector.useVector)(0, 0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const scroll = (0, _reactNativeReanimated.useSharedValue)(0);
  const scrollOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  const isScrolling = (0, _reactNativeReanimated.useSharedValue)(false);
  const hasZoomed = (0, _reactNativeReanimated.useSharedValue)(false);
  const overflow = (0, _reactNativeReanimated.useSharedValue)('hidden');
  const hideAdjacentItems = (0, _reactNativeReanimated.useSharedValue)(false);
  const context = {
    rootSize,
    rootChildSize,
    scroll,
    scrollOffset,
    translate,
    activeIndex,
    isScrolling,
    scale,
    hasZoomed,
    overflow,
    hideAdjacentItems
  };
  return /*#__PURE__*/_react.default.createElement(_context.GalleryContext.Provider, {
    value: context
  }, /*#__PURE__*/_react.default.createElement(_Gallery.default, _extends({}, props, {
    initialIndex: startIndex,
    reference: ref
  })));
};
var _default = exports.default = /*#__PURE__*/(0, _react.forwardRef)(GalleryProvider);
//# sourceMappingURL=GalleryProvider.js.map