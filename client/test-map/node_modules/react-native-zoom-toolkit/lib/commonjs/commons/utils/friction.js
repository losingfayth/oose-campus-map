"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.friction = void 0;
const friction = overScrollFraction => {
  'worklet';

  return 1 * Math.pow(1 - overScrollFraction, 2);
};
exports.friction = friction;
//# sourceMappingURL=friction.js.map