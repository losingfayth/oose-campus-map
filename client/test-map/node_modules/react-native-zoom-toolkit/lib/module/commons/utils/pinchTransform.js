export const pinchTransform = options => {
  'worklet';

  const {
    toScale,
    fromScale,
    delta,
    origin,
    offset
  } = options;
  const fromPinchX = -1 * (origin.x * fromScale - origin.x);
  const fromPinchY = -1 * (origin.y * fromScale - origin.y);
  const toPinchX = -1 * (origin.x * toScale - origin.x);
  const toPinchY = -1 * (origin.y * toScale - origin.y);
  const x = offset.x + toPinchX - fromPinchX + delta.x;
  const y = offset.y + toPinchY - fromPinchY + delta.y;
  return {
    x,
    y
  };
};
//# sourceMappingURL=pinchTransform.js.map