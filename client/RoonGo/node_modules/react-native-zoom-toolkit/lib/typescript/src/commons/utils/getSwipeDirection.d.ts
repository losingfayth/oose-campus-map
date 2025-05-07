import type { PanGestureEvent, SwipeDirection, Vector } from '../types';
type SwipeOptions = {
    time: number;
    boundaries: Vector<number>;
    position: Vector<number>;
    translate: Vector<number>;
};
export declare const getSwipeDirection: (e: PanGestureEvent, options: SwipeOptions) => SwipeDirection | undefined;
export {};
//# sourceMappingURL=getSwipeDirection.d.ts.map