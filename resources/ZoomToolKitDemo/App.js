// import React from "react";
// import { Image, ImageBackground, useWindowDimensions } from "react-native";
// import {
//   fitContainer,
//   ResumableZoom,
//   useImageResolution,
// } from "react-native-zoom-toolkit";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { Svg, Path } from "react-native-svg";
// import points from "./components/Points";
// import generatePath from "./components/PathGenerator";

/**
 *  To run this code, make sure you have the following libraries installed:
 *  npm install react-native-zoom-toolkit
 *  npm install react-native-reanimated@~3.16.1
 *  npm install react-native-gesture-handler@~2.20.2
 *  npm install react-native-svg@15.8.0
 *
 *
 *  Demostrates the use of the ResumableZoom feature for zooming in on
 *  our floorplan image. ImageBackground is required as the image type
 *  so that we can draw on top of it. Also, demostrates the use of the
 *  Points class (used for testing gathering points from the database),
 *  and the PathGenerator class. After the image is rendered, we draw
 *  the user's "path" on the screen.
 *
 *  @author Ethan Broskoskie
 */

import React from "react";
import { ImageBackground, useWindowDimensions, Image } from "react-native";
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
} from "react-native-zoom-toolkit";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Svg, Path, Circle } from "react-native-svg";
import { points, originalImageSize } from "./components/Points";
import generatePath from "./components/PathGenerator";

const uri = Image.resolveAssetSource(require("./assets/BFB-1-2.jpg")).uri;

const App = () => {
  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri });

  if (isFetching || resolution === undefined) {
    return null;
  }

  // Get the resized image dimensions
  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  return (
    <GestureHandlerRootView>
      <ResumableZoom maxScale={resolution}>
        <ImageBackground
          source={{ uri }}
          style={{ ...size }}
          resizeMethod={"scale"}
        >
          <Svg width={size.width} height={size.height}>
            <Path
              d={generatePath(points, size)}
              stroke="blue"
              strokeWidth={5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray="5 10" // 5 units of stroke with 10 units of space
            />
            {/* Add a circle at the last point */}
            {points.length > 0 && (
              <Circle
                cx={points[points.length - 1].x * size.width} // Scale x position
                cy={points[points.length - 1].y * size.height} // Scale y position
                r={8} // Radius of the circle
                fill="lime" // Color of the circle
              />
            )}
            {points.length > 0 && (
              <Circle
                cx={points[0].x * size.width} // Scale x position
                cy={points[0].y * size.height} // Scale y position
                r={8} // Radius of the circle
                fill="blue" // Color of the circle
              />
            )}
          </Svg>
        </ImageBackground>
      </ResumableZoom>
    </GestureHandlerRootView>
  );
};

export default App;
