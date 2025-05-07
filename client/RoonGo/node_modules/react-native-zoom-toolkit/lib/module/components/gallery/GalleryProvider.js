function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { forwardRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { clamp } from '../../commons/utils/clamp';
import { useVector } from '../../commons/hooks/useVector';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import Gallery from './Gallery';
import { GalleryContext } from './context';
const GalleryProvider = (props, ref) => {
  const startIndex = clamp(props.initialIndex ?? 0, 0, props.data.length - 1);
  const activeIndex = useSharedValue(startIndex);
  const rootSize = useSizeVector(0, 0);
  const rootChildSize = useSizeVector(0, 0);
  const translate = useVector(0, 0);
  const scale = useSharedValue(1);
  const scroll = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const hasZoomed = useSharedValue(false);
  const overflow = useSharedValue('hidden');
  const hideAdjacentItems = useSharedValue(false);
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
  return /*#__PURE__*/React.createElement(GalleryContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(Gallery, _extends({}, props, {
    initialIndex: startIndex,
    reference: ref
  })));
};
export default /*#__PURE__*/forwardRef(GalleryProvider);
//# sourceMappingURL=GalleryProvider.js.map