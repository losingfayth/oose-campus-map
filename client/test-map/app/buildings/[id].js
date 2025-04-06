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
import PointNormalizer from "../utils/PointsNormalizer";
import generatePath from "../components/PathGenerator";

import imagePaths, { ImageReferences, buildingCorners, getImageReferences, getImageReference } from "../assets/build_images/imagePaths";
import CoordinateMap from "../utils/CoordinateMap";

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

// const uri = Image.resolveAssetSource(
//   require("../assets/build_images/BFB-1.jpg")
// ).uri;

export default function Building() {
  const router = useRouter();

  const { id, categories, coords, currLoc, maxLocs } = useLocalSearchParams();
  const parsedPoints = coords ? JSON.parse(coords) : [];
  const locs = JSON.parse(categories || "[]"); // Convert back to an array
  const currIndex = parseInt(currLoc);

  const getImageUri = (building) => {
    return Image.resolveAssetSource(imagePaths[building]).uri;
  };
  const uri = getImageUri(locs[currIndex]);

  let imageReferencePoints = getImageReference(locs[currIndex]);

  const normalizedPoints = PointNormalizer.normalizePoints(
    parsedPoints[currIndex],
    locs[currIndex]
  );
  // console.log(normalizedPoints);

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

  if (isFetching || resolution === undefined) {
    return null;
  }

  // Get the resized image dimensions
  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  console.log(size);

  let m = new CoordinateMap(
    CoordinateMap.fromReference(imageReferencePoints.referencePoints),

    [
      [0, 0],
      [size.width, 0],
      [0, size.height]
    ],
  );

  //41.006674, -76.448270, 41.007064, -76.448570,
  let mapped = m.convert(41.0068, -76.4483);
  console.log("mapped: " + mapped.x + ", " + mapped.y);
  // console.log("size.width: " + size.width);


  if (locs[currIndex] !== "OUT") {
    return (
      <GestureHandlerRootView>
        <View style={styles.textContainer}>
          <Text>List of Buildings: {categories}</Text>
          <Text>Building ID: {id}</Text>
          <Text>Current Location in Array: {currLoc}</Text>
          <Text>Maximum Locations in Array: {maxLocs}</Text>
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

        {/* Previous button (only if not at the first location) */}
        {currIndex > 0 && (
          <View style={[styles.buttonWrapper, styles.leftButton]}>
            <Button
              title="Prev"
              onPress={() => {
                router.push({
                  pathname: `/buildings/${locs[currIndex - 1]}`,
                  params: {
                    categories: JSON.stringify(locs),
                    coords: JSON.stringify(parsedPoints),
                    currLoc: currIndex - 1,
                    maxLocs,
                  },
                });
              }}
            />
          </View>
        )}

        <View style={[styles.buttonWrapper, styles.centerButton]}>
          <Button
            title="Home"
            onPress={() => {
              router.push({
                pathname: "../pages/Start",
                params: {
                  categories: null,
                  coords: null,
                  currLoc: 0,
                  maxLocs: 0,
                },
              });
            }}
          />
        </View>

        {/* Next button (only if there are more locations) */}
        {currIndex < maxLocs && (
          <View style={[styles.buttonWrapper, styles.rightButton]}>
            <Button
              title="Next"
              onPress={() => {
                router.push({
                  pathname: `/buildings/${locs[currIndex + 1]}`,
                  params: {
                    categories: JSON.stringify(locs),
                    coords: JSON.stringify(parsedPoints),
                    currLoc: currIndex + 1,
                    maxLocs,
                  },
                });
              }}
            />
          </View>
        )}
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
