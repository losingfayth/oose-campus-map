import React from 'react';
import type { GalleryTransitionCallback } from './types';
type GalleryItemProps = {
    item: any;
    index: number;
    gap: number;
    zIndex: number;
    vertical: boolean;
    renderItem: (item: any, index: number) => React.ReactElement;
    customTransition?: GalleryTransitionCallback;
};
declare const _default: React.MemoExoticComponent<({ index, gap, zIndex, item, vertical, renderItem, customTransition, }: GalleryItemProps) => JSX.Element>;
export default _default;
//# sourceMappingURL=GalleryItem.d.ts.map