import React from "react";
import { Image, ImageBackground, useWindowDimensions } from "react-native";
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
} from "react-native-zoom-toolkit";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Svg, Path } from "react-native-svg";
import points from "./components/Points";
import generatePath from "./components/PathGenerator";

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

const uri = Image.resolveAssetSource(require("./assets/BFB-1.jpg")).uri;

const App = () => {
  /**
   *  Below is some boiler plate code for implementing the Resumable Zoom
   */
  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri });
  if (isFetching || resolution === undefined) {
    return null;
  }
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
          <Svg>
            <Path
              d={generatePath(points)}
              stroke="blue"
              strokeWidth={5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
        </ImageBackground>
      </ResumableZoom>
    </GestureHandlerRootView>
  );
};

export default App;
