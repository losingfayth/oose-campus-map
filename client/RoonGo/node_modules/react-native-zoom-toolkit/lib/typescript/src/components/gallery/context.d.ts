import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../../commons/types';
export type GalleryContextType = {
    rootSize: SizeVector<SharedValue<number>>;
    rootChildSize: SizeVector<SharedValue<number>>;
    translate: Vector<SharedValue<number>>;
    scale: SharedValue<number>;
    scroll: SharedValue<number>;
    scrollOffset: SharedValue<number>;
    activeIndex: SharedValue<number>;
    isScrolling: SharedValue<boolean>;
    hasZoomed: SharedValue<boolean>;
    overflow: SharedValue<'hidden' | 'visible'>;
    hideAdjacentItems: SharedValue<boolean>;
};
export declare const GalleryContext: React.Context<GalleryContextType>;
//# sourceMappingURL=context.d.ts.map