import React from 'react';
import type { CropZoomType } from './types';
declare const _default: React.ForwardRefExoticComponent<{
    cropSize: import("../../commons/types").SizeVector<number>;
    resolution: import("../../commons/types").SizeVector<number>;
    onUpdate?: import("./types").CropGestureEventCallBack | undefined;
    OverlayComponent?: (() => React.ReactElement<any, string | React.JSXElementConstructor<any>>) | undefined;
} & {
    children?: React.ReactNode;
} & Partial<{
    minScale: number;
    maxScale: number;
    panMode: import("../../commons/types").PanMode;
    scaleMode: import("../../commons/types").ScaleMode;
    allowPinchPanning: boolean;
    onGestureEnd: () => void;
}> & Partial<{
    onPanStart: import("../../commons/types").PanGestureEventCallback;
    onPanEnd: import("../../commons/types").PanGestureEventCallback;
}> & Partial<{
    onPinchStart: import("../../commons/types").PinchGestureEventCallback;
    onPinchEnd: import("../../commons/types").PinchGestureEventCallback;
}> & Omit<Partial<{
    onTap: import("../../commons/types").TapGestureEventCallback;
    onDoubleTap: import("../../commons/types").TapGestureEventCallback;
}>, "onDoubleTap"> & React.RefAttributes<CropZoomType>>;
export default _default;
//# sourceMappingURL=CropZoom.d.ts.map