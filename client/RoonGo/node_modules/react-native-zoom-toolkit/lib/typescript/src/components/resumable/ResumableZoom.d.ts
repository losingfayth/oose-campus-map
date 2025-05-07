import React from 'react';
import type { CommonZoomState } from '../../commons/types';
import type { ResumableZoomType } from './types';
declare const _default: React.ForwardRefExoticComponent<Partial<{
    style: import("react-native").ViewStyle;
    decay: boolean;
    extendGestures: boolean;
    tapsEnabled: boolean;
    panEnabled: boolean;
    pinchEnabled: boolean;
    maxScale: number | import("../../commons/types").SizeVector<number>;
    pinchCenteringMode: import("../../commons/types").PinchCenteringMode;
    onSwipe: (direction: import("../../commons/types").SwipeDirection) => void;
    onUpdate: (e: CommonZoomState<number>) => void;
    onOverPanning: (x: number, y: number) => void;
}> & {
    children: React.ReactNode;
} & Partial<{
    onPanStart: import("../../commons/types").PanGestureEventCallback;
    onPanEnd: import("../../commons/types").PanGestureEventCallback;
}> & Partial<{
    onPinchStart: import("../../commons/types").PinchGestureEventCallback;
    onPinchEnd: import("../../commons/types").PinchGestureEventCallback;
}> & Omit<Partial<{
    onTap: import("../../commons/types").TapGestureEventCallback;
    onDoubleTap: import("../../commons/types").TapGestureEventCallback;
}>, "onDoubleTap"> & Omit<Partial<{
    minScale: number;
    maxScale: number;
    panMode: import("../../commons/types").PanMode;
    scaleMode: import("../../commons/types").ScaleMode;
    allowPinchPanning: boolean;
    onGestureEnd: () => void;
}>, "maxScale"> & React.RefAttributes<ResumableZoomType>>;
export default _default;
//# sourceMappingURL=ResumableZoom.d.ts.map