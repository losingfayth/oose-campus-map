import { type SharedValue } from 'react-native-reanimated';
import type { CommonZoomState } from '../commons/types';
import type { SnapbackZoomState } from '../components/snapback/types';
import type { CropZoomState } from '../components/crop/types';
type ComponentSelection = 'resumable' | 'snapback' | 'crop';
type StateSelection<T extends ComponentSelection, S> = T extends 'snapback' ? SnapbackZoomState<S> : T extends 'crop' ? CropZoomState<S> : CommonZoomState<S>;
type TransformNames = 'matrix' | 'translateX' | 'translateY';
type Matrix4x4 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
type Transformations = {
    [Name in TransformNames]: Name extends 'matrix' ? Matrix4x4 : number;
};
type Transforms3d = Pick<Transformations, 'matrix'> | Pick<Transformations, 'translateX'> | Pick<Transformations, 'translateY'>;
type TransformationState<T extends ComponentSelection> = {
    onUpdate: (state: StateSelection<T, number>) => void;
    state: StateSelection<T, SharedValue<number>>;
    transform: Readonly<SharedValue<Transforms3d[]>>;
};
export declare const useTransformationState: <T extends ComponentSelection>(param: T) => TransformationState<T>;
export {};
//# sourceMappingURL=useTransformationState.d.ts.map