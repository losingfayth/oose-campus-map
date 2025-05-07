import type { SizeVector, Vector, Rect } from '../types';
type Options = {
    scale: number;
    translation: Vector<number>;
    itemSize: SizeVector<number>;
    containerSize: SizeVector<number>;
};
export declare const getVisibleRect: (options: Options) => Rect;
export {};
//# sourceMappingURL=getVisibleRect.d.ts.map