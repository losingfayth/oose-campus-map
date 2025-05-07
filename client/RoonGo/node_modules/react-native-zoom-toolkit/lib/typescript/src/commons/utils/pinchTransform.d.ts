import type { Vector } from '../types';
type PinchOptions = {
    toScale: number;
    fromScale: number;
    origin: Vector<number>;
    delta: Vector<number>;
    offset: Vector<number>;
};
export declare const pinchTransform: (options: PinchOptions) => Vector<number>;
export {};
//# sourceMappingURL=pinchTransform.d.ts.map