export const getMaxScale = (canvasSize, resolution) => {
  'worklet';

  if (resolution.width > resolution.height) {
    return Math.max(1, resolution.width / canvasSize.width);
  }
  return Math.max(1, resolution.height / canvasSize.height);
};
//# sourceMappingURL=getMaxScale.js.map