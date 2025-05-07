import { Extrapolation, interpolate } from 'react-native-reanimated';
export const resizeToAspectRatio = ({
  resizeConfig,
  width,
  height,
  scale
}) => {
  'worklet';

  let finalWidth = width;
  let finalHeight = height;
  if (resizeConfig !== undefined) {
    const {
      size,
      aspectRatio,
      scale: resizeScale
    } = resizeConfig;
    const isWide = aspectRatio > 1;
    finalWidth = isWide ? interpolate(scale, [1, resizeScale], [size.width, size.height * aspectRatio], Extrapolation.CLAMP) : size.width;
    finalHeight = isWide ? size.height : interpolate(scale, [1, resizeScale], [size.height, size.width / aspectRatio], Extrapolation.CLAMP);
  }
  const deltaX = (finalWidth - width) / 2;
  const deltaY = (finalHeight - height) / 2;
  return {
    width: finalWidth,
    height: finalHeight,
    deltaX,
    deltaY
  };
};
//# sourceMappingURL=resizeToAspectRatio.js.map