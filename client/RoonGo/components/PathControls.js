import {
    ImageBackground,
    useWindowDimensions,
    Image,
    View,
    Text,
    StyleSheet,
    Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";


const PathControls = (
    { 
		locs,
        parsedPoints,
        currIndex,
        maxLocs,
    }
) => {
    const router = useRouter();

    return (
        <>
            {/* Previous button (only if not at the first location) */}
            {
                currIndex > 0 && (
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
                )
            }

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
            {
                currIndex < maxLocs && (
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
                )
            }
        </>
    )

}

const styles = StyleSheet.create({

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

export default PathControls;