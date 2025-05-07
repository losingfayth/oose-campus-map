import React from 'react';
import { type GalleryProps, type GalleryType } from './types';
type GalleryPropsWithRef<T> = GalleryProps<T> & {
    reference?: React.ForwardedRef<GalleryType>;
};
declare const Gallery: <T>(props: GalleryPropsWithRef<T>) => JSX.Element;
export default Gallery;
//# sourceMappingURL=Gallery.d.ts.map