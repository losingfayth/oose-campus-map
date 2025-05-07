import { type SharedValue } from 'react-native-reanimated';
import type { BoundsFuction, SizeVector, TapGestureEvent, Vector } from '../types';
type DoubleTapOptions = {
    container: SizeVector<SharedValue<number>>;
    translate: Vector<SharedValue<number>>;
    scale: SharedValue<number>;
    minScale: number;
    maxScale: SharedValue<number>;
    scaleOffset: SharedValue<number>;
    boundsFn: BoundsFuction;
    onGestureEnd?: () => void;
};
export declare const useDoubleTapCommons: ({ container, translate, scale, minScale, maxScale, scaleOffset, boundsFn, onGestureEnd, }: DoubleTapOptions) => {
    onDoubleTapEnd: (event: TapGestureEvent) => void;
};
export {};
//# sourceMappingURL=useDoubleTapCommons.d.ts.map