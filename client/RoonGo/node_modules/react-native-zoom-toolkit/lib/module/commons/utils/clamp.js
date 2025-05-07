export const clamp = (value, min, max) => {
  'worklet';

  return Math.max(min, Math.min(value, max));
};
//# sourceMappingURL=clamp.js.map