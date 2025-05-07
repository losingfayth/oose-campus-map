import type { ResizeConfig } from '../../components/snapback/types';
type ResizeOptions = {
    resizeConfig: ResizeConfig | undefined;
    width: number;
    height: number;
    scale: number;
};
type AspectRatioSize = {
    width: number;
    height: number;
    deltaX: number;
    deltaY: number;
};
export declare const resizeToAspectRatio: ({ resizeConfig, width, height, scale, }: ResizeOptions) => AspectRatioSize;
export {};
//# sourceMappingURL=resizeToAspectRatio.d.ts.map