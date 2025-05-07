import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ImageBackground,
  useWindowDimensions,
  Image,
  View,
  Text,
  StyleSheet,
  Button,
} from "react-native";
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
} from "react-native-zoom-toolkit";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Svg, Path, Circle } from "react-native-svg";
// import { points, originalImageSize } from "../components/Points";
import PointNormalizer from "../../utils/PointsNormalizer.js";
import generatePath from "../../utils/PathGenerator.js";

import blueprintImageData, {
  getImageReference,
} from "../../utils/imagePaths.js";
import CoordinateMap from "../../utils/CoordinateMap.js";
import { getBuildings, getRooms, findPath } from "../../utils/api_functions.js";
import LocationNode from "../../dataObject/LocationNode.js";
import PathControls from "../../components/PathControls.js";
/**
 *  To run this code, make sure you have the following libraries installed:
 *  npm install react-native-zoom-toolkit
 *  npm install react-native-reanimated@~3.16.1
 *  npm install react-native-gesture-handler@~2.20.2
 *  npm install react-native-svg@15.8.0
 *
 *
 *  @author Ethan Broskoskie
 */

function mapPointsToPixels(points, coordinateMap) {
  return points.map((point) => {
    const mapped = coordinateMap.convert(point.latitude, point.longitude);
    return { x: mapped.x, y: mapped.y };
  });
}

export default function Building() {
  // from here---------------------------------------------------------------------------------
  const router = useRouter();

  const { id, categories, coords, currLoc, maxLocs } = useLocalSearchParams();
  const parsedPoints = coords ? JSON.parse(coords) : [];
  const locs = JSON.parse(categories || "[]"); // Convert back to an array
  const currIndex = parseInt(currLoc);

  const getImageUri = (building) => {
    return Image.resolveAssetSource(blueprintImageData[building].image).uri;
  };
  const uri = getImageUri(locs[currIndex]);


  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri });

  useEffect(() => {
    if (locs[currIndex] === "OUT") {
      router.push({
        pathname: "/pages/App",
        params: {
          categories: JSON.stringify(locs),
          coords: JSON.stringify(parsedPoints),
          currLoc: currIndex,
          maxLocs,
        },
      });
    }
  }, [currIndex, locs, router]);

  // check whether the resolution of the image is still
  // being fetched or if it's undefined
  if (isFetching || resolution === undefined) {
    console.log("Returning null for image resolution");
    return null;
  }

  var printReferencePoints = (p) => {
    console.log("ReferencePoints: topLeft ", p.topLeft.latitude + ", " + p.topLeft.longitude);
  }
  /**
   * Once the image resolution is fetched and available, this line
   * calculates the appropriate size for the image based on the device's
   * screen size and the image’s resolution (aspect ratio).
   *
   * fitContainer() calculates the best fitting dimensions for the image,
   * keeping its aspect ratio consistent while ensuring that the image
   * fits within the available screen size
   */
  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });
  // to here-----------------------------------------------------------------------------------
  // must move as one big block ---------------------------------------------------------------

  let imageReferencePoints = blueprintImageData[locs[currIndex]].reference;
  printReferencePoints(imageReferencePoints);

  let m = new CoordinateMap(CoordinateMap.fromReference(imageReferencePoints), [
    0,
    0,
    size.width,
    0,
    0,
    size.height,
  ]);

  const pixelPoints = mapPointsToPixels(parsedPoints[currIndex], m);
  const normalizedPoints = PointNormalizer.normalizePoints(pixelPoints, size);

  if (locs[currIndex] !== "OUT") {
    return (
      <GestureHandlerRootView>
        <View style={styles.textContainer}>
          {/* <Text>List of Buildings: {categories}</Text>
          <Text>Building ID: {id}</Text>
          <Text>Current Location in Array: {currLoc}</Text>
          <Text>Maximum Locations in Array: {maxLocs}</Text> */}
        </View>
        <ResumableZoom maxScale={resolution}>
          <ImageBackground
            source={{ uri }}
            style={{ ...size }}
            resizeMethod={"scale"}
          >
            <Svg width={size.width} height={size.height}>
              <Path
                d={generatePath(normalizedPoints, size)}
                stroke="blue"
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="5 10" // 5 units of stroke with 10 units of space
              />
              {/* Add a circle at the last point */}
              {normalizedPoints.length > 0 && (
                <Circle
                  cx={
                    normalizedPoints[normalizedPoints.length - 1].x * size.width
                  } // Scale x position
                  cy={
                    normalizedPoints[normalizedPoints.length - 1].y *
                    size.height
                  } // Scale y position
                  r={8} // Radius of the circle
                  fill={currLoc < maxLocs ? "blue" : "red"} // Conditional fill color
                />
              )}
              {normalizedPoints.length > 0 && (
                <Circle
                  cx={normalizedPoints[0].x * size.width} // Scale x position
                  cy={normalizedPoints[0].y * size.height} // Scale y position
                  r={8} // Radius of the circle
                  fill={currLoc == 0 ? "lime" : "blue"}
                />
              )}
            </Svg>
          </ImageBackground>
        </ResumableZoom>

        <PathControls
          locs={locs}
          parsedPoints={parsedPoints}
          currIndex={currIndex}
          maxLocs={maxLocs}
        />
      </GestureHandlerRootView>
    );
  } else {
    return null;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    top: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrapper: {
    position: "absolute",
    bottom: "10%",
  },
  leftButton: {
    left: "10%",
  },
  centerButton: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
  },
  rightButton: {
    right: "10%",
  },
});
