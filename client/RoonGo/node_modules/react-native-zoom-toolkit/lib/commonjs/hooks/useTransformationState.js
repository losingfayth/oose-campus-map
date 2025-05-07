"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTransformationState = void 0;
var _reactNative = require("react-native");
var _reactNativeReanimated = require("react-native-reanimated");
var _useVector = require("../commons/hooks/useVector");
var _useSizeVector = require("../commons/hooks/useSizeVector");
const {
  width,
  height
} = _reactNative.Dimensions.get('window');
const initialPosition = -1 * Math.max(width, height);
const useTransformationState = param => {
  const size = (0, _useSizeVector.useSizeVector)(0, 0);
  const translate = (0, _useVector.useVector)(0, 0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const xy = (0, _useVector.useVector)(initialPosition, initialPosition);
  const resize = (0, _useSizeVector.useSizeVector)(0, 0);
  const rotate = (0, _useVector.useVector)(0, 0);
  const rotation = (0, _reactNativeReanimated.useSharedValue)(0);

  // Matrices taken from https://stackoverflow.com/questions/77616182/x-rotation-looks-weird
  const transform = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const r = rotation.value;
    const rx = rotate.x.value;
    const ry = rotate.y.value;
    const sc = scale.value;

    // Precalculated matrix for scale, rotate, rotateX and rotateY transformations.
    const matrix = [];
    matrix[0] = sc * Math.cos(ry) * Math.cos(r);
    matrix[1] = sc * Math.sin(ry) * Math.sin(rx) * Math.cos(r) - sc * Math.cos(rx) * Math.sin(r);
    matrix[2] = sc * Math.sin(rx) * Math.sin(r) + sc * Math.sin(ry) * Math.cos(rx) * Math.cos(r);
    matrix[3] = 0;
    matrix[4] = sc * Math.cos(ry) * Math.sin(r);
    matrix[5] = sc * Math.cos(rx) * Math.cos(r) + sc * Math.sin(ry) * Math.sin(rx) * Math.sin(r);
    matrix[6] = sc * Math.sin(ry) * Math.cos(rx) * Math.sin(r) - sc * Math.sin(rx) * Math.cos(r);
    matrix[7] = 0;
    matrix[8] = -1 * Math.sin(ry);
    matrix[9] = Math.cos(ry) * Math.sin(rx);
    matrix[10] = Math.cos(ry) * Math.cos(rx);
    matrix[11] = 0;
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;
    return [{
      translateX: translate.x.value
    }, {
      translateY: translate.y.value
    }, {
      matrix
    }];
  }, [translate, scale, rotation, rotate]);
  const createSharedState = () => {
    // @ts-ignore
    const state = {
      width: size.width,
      height: size.height,
      translateX: translate.x,
      translateY: translate.y,
      scale: scale
    };
    if (param === 'crop') {
      state.rotateX = rotate.x;
      state.rotateY = rotate.y;
      state.rotate = rotation;
    }
    if (param === 'snapback') {
      state.x = xy.x;
      state.y = xy.y;
      state.resizedWidth = resize.width;
      state.resizedHeight = resize.height;
    }
    return state;
  };
  const onUpdate = state => {
    'worklet';

    size.width.value = state.width;
    size.height.value = state.height;
    translate.x.value = state.translateX;
    translate.y.value = state.translateY;
    scale.value = state.scale;
    if (param === 'crop') {
      const cropState = state;
      rotate.x.value = cropState.rotateX;
      rotate.y.value = cropState.rotateY;
      rotation.value = cropState.rotate;
    }
    if (param === 'snapback') {
      const snapbackState = state;
      snapbackState.resizedWidth && (resize.width.value = snapbackState.resizedWidth);
      snapbackState.resizedHeight && (resize.height.value = snapbackState.resizedHeight);
      xy.x.value = state.x;
      xy.y.value = state.y;
    }
  };
  const sharedState = createSharedState();
  return {
    onUpdate,
    transform,
    state: sharedState
  };
};
exports.useTransformationState = useTransformationState;
//# sourceMappingURL=useTransformationState.js.map