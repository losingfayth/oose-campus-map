import { type SharedValue } from 'react-native-reanimated';
import type { GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import type { PanMode, BoundsFuction, Vector, SizeVector, PanGestureEventCallback, PanGestureEvent, SwipeDirection } from '../types';
type PanCommmonOptions = {
    container: SizeVector<SharedValue<number>>;
    translate: Vector<SharedValue<number>>;
    offset: Vector<SharedValue<number>>;
    panMode: PanMode;
    decay?: boolean;
    boundFn: BoundsFuction;
    userCallbacks: Partial<{
        onGestureEnd: () => void;
        onPanStart: PanGestureEventCallback;
        onPanEnd: PanGestureEventCallback;
        onSwipe: (direction: SwipeDirection) => void;
        onOverPanning: (x: number, y: number) => void;
    }>;
};
type PanGestureUpdadeEvent = GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>;
export declare const usePanCommons: (options: PanCommmonOptions) => {
    onPanStart: (e: PanGestureEvent) => void;
    onPanChange: (e: PanGestureUpdadeEvent) => void;
    onPanEnd: (e: PanGestureEvent) => void;
};
export {};
//# sourceMappingURL=usePanCommons.d.ts.map