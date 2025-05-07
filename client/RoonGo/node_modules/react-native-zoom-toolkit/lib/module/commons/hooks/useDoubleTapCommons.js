import { runOnJS, withTiming } from 'react-native-reanimated';
import { pinchTransform } from '../utils/pinchTransform';
import { clamp } from '../utils/clamp';
export const useDoubleTapCommons = ({
  container,
  translate,
  scale,
  minScale,
  maxScale,
  scaleOffset,
  boundsFn,
  onGestureEnd
}) => {
  const onDoubleTapEnd = event => {
    'worklet';

    const originX = event.x - container.width.value / 2;
    const originY = event.y - container.height.value / 2;
    const toScale = scale.value >= maxScale.value * 0.8 ? minScale : maxScale.value;
    const {
      x,
      y
    } = pinchTransform({
      toScale: toScale,
      fromScale: scale.value,
      origin: {
        x: originX,
        y: originY
      },
      delta: {
        x: 0,
        y: 0
      },
      offset: {
        x: translate.x.value,
        y: translate.y.value
      }
    });
    const {
      x: boundX,
      y: boundY
    } = boundsFn(toScale);
    const toX = clamp(x, -1 * boundX, boundX);
    const toY = clamp(y, -1 * boundY, boundY);
    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);
    scaleOffset.value = toScale;
    scale.value = withTiming(toScale, undefined, finished => {
      finished && onGestureEnd && runOnJS(onGestureEnd)();
    });
  };
  return {
    onDoubleTapEnd
  };
};
//# sourceMappingURL=useDoubleTapCommons.js.map