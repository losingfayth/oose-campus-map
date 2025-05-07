export const getScrollPosition = options => {
  'worklet';

  const {
    index,
    itemSize,
    gap
  } = options;
  return index * itemSize + index * gap;
};
//# sourceMappingURL=getScrollPosition.js.map