import React from 'react';
import { type SharedValue } from 'react-native-reanimated';
import type { ScaleMode, PinchCenteringMode } from '../../commons/types';
import { type GalleryProps } from './types';
type GalleryGestureHandlerProps = {
    length: number;
    gap: number;
    maxScale: SharedValue<number>;
    itemSize: Readonly<SharedValue<number>>;
    vertical: boolean;
    tapOnEdgeToItem: boolean;
    allowPinchPanning: boolean;
    allowOverflow: boolean;
    zoomEnabled: boolean;
    scaleMode: ScaleMode;
    pinchCenteringMode: PinchCenteringMode;
    onTap?: GalleryProps['onTap'];
    onPanStart?: GalleryProps['onPanStart'];
    onPanEnd?: GalleryProps['onPanEnd'];
    onPinchStart?: GalleryProps['onPinchStart'];
    onPinchEnd?: GalleryProps['onPinchEnd'];
    onSwipe?: GalleryProps['onSwipe'];
    onVerticalPull?: GalleryProps['onVerticalPull'];
    onGestureEnd?: GalleryProps['onGestureEnd'];
};
declare const _default: React.MemoExoticComponent<({ length, gap, maxScale, itemSize, vertical, tapOnEdgeToItem, zoomEnabled, scaleMode, allowOverflow, allowPinchPanning, pinchCenteringMode, onTap, onPanStart, onPanEnd, onPinchStart: onUserPinchStart, onPinchEnd: onUserPinchEnd, onSwipe: onUserSwipe, onVerticalPull, onGestureEnd, }: GalleryGestureHandlerProps) => JSX.Element>;
export default _default;
//# sourceMappingURL=GalleryGestureHandler.d.ts.map