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

const generatePath = (points) => {
  if (points.length === 0) return "";
  return points
    .map((point, index) =>
      index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`
    )
    .join(" ");
};

export default generatePath;
