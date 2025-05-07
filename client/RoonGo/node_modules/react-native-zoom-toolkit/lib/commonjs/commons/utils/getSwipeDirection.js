"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSwipeDirection = void 0;
const SWIPE_TIME = 175;
const SWIPE_VELOCITY = 500;
const SWIPE_DISTANCE = 20;
const getSwipeDirection = (e, options) => {
  'worklet';

  const {
    time,
    boundaries,
    position,
    translate
  } = options;
  const deltaTime = performance.now() - time;
  const {
    x: boundX,
    y: boundY
  } = boundaries;
  const swipedDistanceX = Math.abs(position.x - e.absoluteX) >= SWIPE_DISTANCE;
  const swipedDistanceY = Math.abs(position.y - e.absoluteY) >= SWIPE_DISTANCE;
  const swipedInTime = deltaTime <= SWIPE_TIME;
  const swipeRight = e.velocityX >= SWIPE_VELOCITY && swipedDistanceX && swipedInTime;
  const inRightBound = translate.x === boundX;
  if (swipeRight && inRightBound) return 'right';
  const swipeLeft = e.velocityX <= -1 * SWIPE_VELOCITY && swipedDistanceX && swipedInTime;
  const inLeftBound = translate.x === -1 * boundX;
  if (swipeLeft && inLeftBound) return 'left';
  const swipeUp = e.velocityY <= -1 * SWIPE_VELOCITY && swipedDistanceY && swipedInTime;
  const inUpperBound = translate.y === -1 * boundY;
  if (swipeUp && inUpperBound) return 'up';
  const swipeDown = e.velocityY >= SWIPE_VELOCITY && swipedDistanceY && swipedInTime;
  const inLowerBound = translate.y === boundY;
  if (swipeDown && inLowerBound) return 'down';
  return undefined;
};
exports.getSwipeDirection = getSwipeDirection;
//# sourceMappingURL=getSwipeDirection.js.map