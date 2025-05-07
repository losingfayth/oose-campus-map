import type { SizeVector, Vector } from '../types';
type CanvasToSizeOptions = {
    scale: number;
    cropSize: SizeVector<number>;
    itemSize: SizeVector<number>;
    resolution: SizeVector<number>;
    translation: Vector<number>;
    isRotated: boolean;
    fixedWidth?: number;
};
export declare const crop: (options: CanvasToSizeOptions) => {
    crop: {
        originX: number;
        originY: number;
        width: number;
        height: number;
    };
    resize: SizeVector<number> | undefined;
};
export {};
//# sourceMappingURL=crop.d.ts.map