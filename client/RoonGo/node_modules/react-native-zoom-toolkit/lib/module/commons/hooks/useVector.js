import { useSharedValue } from 'react-native-reanimated';
export const useVector = (x, y) => {
  const first = useSharedValue(x);
  const second = useSharedValue(y);
  return {
    x: first,
    y: second
  };
};
//# sourceMappingURL=useVector.js.map