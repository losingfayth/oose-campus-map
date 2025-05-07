function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { forwardRef } from 'react';
export default function withCropValidation(Component) {
  return /*#__PURE__*/forwardRef((props, ref) => {
    const {
      minScale,
      maxScale
    } = props;
    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale property must be greater than or equals one');
    }
    if (maxScale !== undefined && maxScale < 1) {
      throw new Error('maxScale property must be greater than or equals one');
    }
    if (minScale !== undefined && maxScale !== undefined && minScale > maxScale) {
      throw new Error('minScale property must not be greater than maxScale');
    }
    return /*#__PURE__*/React.createElement(Component, _extends({}, props, {
      reference: ref
    }));
  });
}
//# sourceMappingURL=withCropValidation.js.map