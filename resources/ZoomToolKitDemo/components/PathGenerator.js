/**
 * Takes an array of (x, y) points and transforms them into a string that
 * represents an SVG path (d attribute).
 *
 * @param {*} points - array of (x, y) coords to draw a path from with
 *                      the order of points being the order to draw the
 *                      path.
 * @returns a string that represents an SVG path (d attribute).
 * @author Ethan Broskoskie
 */

const generatePath = (points, imageSize) => {
  if (points.length === 0 || !imageSize) return "";

  return points
    .map((point, index) => {
      const scaledX = point.x * imageSize.width;
      const scaledY = point.y * imageSize.height;
      return index === 0 ? `M${scaledX},${scaledY}` : `L${scaledX},${scaledY}`;
    })
    .join(" ");
};

export default generatePath;
