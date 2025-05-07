"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _useVector = require("../../commons/hooks/useVector");
var _useSizeVector = require("../../commons/hooks/useSizeVector");
var _context = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const GalleryItem = ({
  index,
  gap,
  zIndex,
  item,
  vertical,
  renderItem,
  customTransition
}) => {
  const {
    rootSize,
    rootChildSize,
    activeIndex,
    scroll,
    isScrolling,
    translate,
    scale,
    overflow,
    hideAdjacentItems
  } = (0, _react.useContext)(_context.GalleryContext);
  const innerSize = (0, _useSizeVector.useSizeVector)(0, 0);
  const innerTranslate = (0, _useVector.useVector)(0, 0);
  const innerScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const measureChild = e => {
    innerSize.width.value = e.nativeEvent.layout.width;
    innerSize.height.value = e.nativeEvent.layout.height;
    if (index === activeIndex.value) {
      rootChildSize.width.value = e.nativeEvent.layout.width;
      rootChildSize.height.value = e.nativeEvent.layout.height;
    }
  };
  const childStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      transform: [{
        translateX: innerTranslate.x.value
      }, {
        translateY: innerTranslate.y.value
      }, {
        scale: innerScale.value
      }]
    };
  }, [innerTranslate, innerScale]);
  const animatedRootStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    overflow: overflow.value,
    opacity: activeIndex.value !== index && hideAdjacentItems.value ? 0 : 1
  }), [overflow, activeIndex, index, hideAdjacentItems]);

  // @ts-ignore
  const transitionStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (customTransition !== undefined) {
      return customTransition({
        index,
        gap,
        activeIndex: activeIndex.value,
        isScrolling: isScrolling.value,
        direction: vertical ? 'vertical' : 'horizontal',
        scroll: scroll.value,
        gallerySize: {
          width: rootSize.width.value,
          height: rootSize.height.value
        }
      });
    }
    const currentScroll = -1 * scroll.value + index * gap;
    const isSizeNotDefined = rootSize.width.value === 0 && rootSize.height.value === 0;
    const opacity = isSizeNotDefined && index !== activeIndex.value ? 0 : 1;
    if (vertical) {
      const translateY = index * rootSize.height.value + currentScroll;
      return {
        transform: [{
          translateY
        }],
        opacity
      };
    }
    const translateX = index * rootSize.width.value + currentScroll;
    return {
      transform: [{
        translateX
      }],
      opacity
    };
  });
  (0, _reactNativeReanimated.useAnimatedReaction)(() => ({
    activeIndex: activeIndex.value,
    translate: {
      x: translate.x.value,
      y: translate.y.value
    },
    scale: scale.value
  }), current => {
    if (index !== current.activeIndex) return;
    innerTranslate.x.value = current.translate.x;
    innerTranslate.y.value = current.translate.y;
    innerScale.value = current.scale;
  }, [activeIndex, translate, scale]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => activeIndex.value, value => {
    if (index === value) {
      rootChildSize.width.value = innerSize.width.value;
      rootChildSize.height.value = innerSize.height.value;
    } else {
      innerTranslate.x.value = 0;
      innerTranslate.y.value = 0;
      innerScale.value = 1;
    }
  }, [activeIndex, innerSize]);
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    testID: `child-${index}`
    // @ts-ignore
    ,
    style: [animatedRootStyles, transitionStyle, {
      zIndex
    }]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: childStyle,
    onLayout: measureChild
  }, renderItem(item, index)));
};
var _default = exports.default = /*#__PURE__*/_react.default.memo(GalleryItem, (prev, next) => {
  return prev.index === next.index && prev.gap === next.gap && prev.zIndex === next.zIndex && prev.vertical === next.vertical && prev.customTransition === next.customTransition && prev.renderItem === next.renderItem;
});
//# sourceMappingURL=GalleryItem.js.map