import React from 'react';
export default function withSnapbackValidation(Component) {
  return props => {
    const childrenCount = React.Children.count(props.children);
    if (childrenCount !== 1) {
      const message = `SnapbackZoom expected one child but received ${childrenCount} children`;
      throw new Error(message);
    }
    return /*#__PURE__*/React.createElement(Component, props);
  };
}
//# sourceMappingURL=withSnapbackValidation.js.map