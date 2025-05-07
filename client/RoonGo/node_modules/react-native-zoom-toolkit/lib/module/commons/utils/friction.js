export const friction = overScrollFraction => {
  'worklet';

  return 1 * Math.pow(1 - overScrollFraction, 2);
};
//# sourceMappingURL=friction.js.map