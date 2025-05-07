import { useSharedValue } from 'react-native-reanimated';
export const useSizeVector = (x, y) => {
  const first = useSharedValue(x);
  const second = useSharedValue(y);
  return {
    width: first,
    height: second
  };
};
//# sourceMappingURL=useSizeVector.js.map