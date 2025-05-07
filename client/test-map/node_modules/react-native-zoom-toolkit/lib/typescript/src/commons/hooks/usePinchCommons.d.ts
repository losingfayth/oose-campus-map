import { type SharedValue } from 'react-native-reanimated';
import type { GestureStateManager, GestureTouchEvent, GestureUpdateEvent, PinchGestureHandlerEventPayload } from 'react-native-gesture-handler';
import type { BoundsFuction, SizeVector, Vector, PinchGestureEventCallback, PinchGestureEvent, ScaleMode, PinchCenteringMode } from '../types';
type PinchOptions = {
    container: SizeVector<SharedValue<number>>;
    translate: Vector<SharedValue<number>>;
    offset: Vector<SharedValue<number>>;
    scale: SharedValue<number>;
    scaleOffset: SharedValue<number>;
    scaleMode: ScaleMode;
    minScale: number;
    maxScale: SharedValue<number>;
    boundFn: BoundsFuction;
    pinchCenteringMode: PinchCenteringMode;
    allowPinchPanning: boolean;
    userCallbacks: Partial<{
        onGestureEnd: () => void;
        onPinchStart: PinchGestureEventCallback;
        onPinchEnd: PinchGestureEventCallback;
    }>;
};
type PinchGestueUpdateEvent = GestureUpdateEvent<PinchGestureHandlerEventPayload>;
export declare const usePinchCommons: (options: PinchOptions) => {
    gesturesEnabled: boolean;
    onTouchesDown: (e: GestureTouchEvent, state: GestureStateManager) => void;
    onTouchesMove: (e: GestureTouchEvent, state: GestureStateManager) => void;
    onTouchesUp: (e: GestureTouchEvent, state: GestureStateManager) => void;
    onPinchStart: (e: PinchGestureEvent) => void;
    onPinchUpdate: (e: PinchGestueUpdateEvent) => void;
    onPinchEnd: (e: PinchGestureEvent) => void;
};
export {};
//# sourceMappingURL=usePinchCommons.d.ts.map