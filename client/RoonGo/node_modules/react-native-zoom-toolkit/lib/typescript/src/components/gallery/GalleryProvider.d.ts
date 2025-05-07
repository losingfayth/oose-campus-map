import React from 'react';
import Gallery from './Gallery';
import type { GalleryProps, GalleryType } from './types';
type GalleryPropsWithRef<T> = GalleryProps<T> & {
    ref?: React.ForwardedRef<GalleryType>;
};
declare const _default: <T>(props: GalleryPropsWithRef<T>) => ReturnType<typeof Gallery>;
export default _default;
//# sourceMappingURL=GalleryProvider.d.ts.map