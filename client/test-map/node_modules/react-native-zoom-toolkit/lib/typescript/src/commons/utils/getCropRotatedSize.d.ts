import type { SizeVector } from '../types';
type Options = {
    crop: SizeVector<number>;
    resolution: SizeVector<number>;
    angle: number;
};
export declare const getRatioSize: (aspectRatio: number, container: Partial<SizeVector<number>>) => SizeVector<number>;
export declare const getCropRotatedSize: (options: Options) => SizeVector<number>;
export {};
//# sourceMappingURL=getCropRotatedSize.d.ts.map