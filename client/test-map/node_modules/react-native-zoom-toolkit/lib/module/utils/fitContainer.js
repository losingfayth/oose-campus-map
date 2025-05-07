export const fitContainer = (aspectRatio, container) => {
  'worklet';

  let width = container.width;
  let height = container.width / aspectRatio;
  if (height > container.height) {
    width = container.height * aspectRatio;
    height = container.height;
  }
  return {
    width,
    height
  };
};
//# sourceMappingURL=fitContainer.js.map