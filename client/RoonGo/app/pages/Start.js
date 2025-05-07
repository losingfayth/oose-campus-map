import React, { useEffect, useState, useCallback } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import {
	StyleSheet,
	View,
	Image,
	StatusBar,
	Pressable,
	Text,
	Switch,
} from "react-native";
import { Link, router } from "expo-router";
import * as Location from "expo-location";
import SearchBar from "../../components/SearchBar";
import { points } from "../../utils/Points";
import ImageButton from "../../components/ImageButton"
import PopupDialog from "../../components/PopupDialog"
import { insideBuilding } from "../../utils/insideBuilding.js";

import { loadImageReferences } from "../../utils/imagePaths.js";

import {
  getBuildings,
  getRooms,
  findPath,
  getPois,
  getNearestBathroom,
  getNumFloors,
  getClosedLocationIdFromBuildingNameFloorNumberAndGCSCoordinates
} from "../../utils/api_functions";
import ProcessedPath from "../../dataObject/ProcessedPath.js";

const fromRoomDefaultPlaceHolderText = "Room #";

export default function Start() {
	const [location, setLocation] = useState(null);
	const [subscription, setTracker] = useState(null);
	const [region, setRegion] = useState({
		latitude: 41.007799728334525,
		longitude: -76.44851515601727,
		latitudeDelta: 0.00922,
		longitudeDelta: 0.00421,
	});

	const [isRegionSet, setIsRegionSet] = useState(false); // New state to track if the region has been set
	const [isBuildingTyping, setIsBuildingTyping] = useState(false);
	const [isRoomTyping, setIsRoomTyping] = useState(false);

	// State to store selected from and room values
	const [selectedStartBuilding, setSelectedStartBuilding] = useState(null);
	const [selectedStartRoom, setSelectedStartRoom] = useState(null);
	const [selectedEndBuilding, setSelectedEndBuilding] = useState(null);
	const [selectedEndRoom, setSelectedEndRoom] = useState(null);

	const [buildingSearchOptions, setBuildingSearchOptions] = useState([]);
	const [pointsOfInterest, setPointsOfInterest] = useState([]);

	const [filteredRoomNumbers, setFilteredStartRoomNumbers] = useState([]);
	const [selectedStartRoomId, setSelectedStartRoomId] = useState(null);
	const [filteredEndRoomNumbers, setFilteredEndRoomNumbers] = useState([]);
	const [selectedEndRoomId, setSelectedEndRoomId] = useState(null);

	const [accessiblePathMode, setAccessiblePathMode] = useState(false);
	const [bathroomPopupVisible, setBathroomPopupVisible] = useState(false);

	const [currentLocationArea, setCurrentLocationArea] = useState(null);
	const [currentLocationChosen, setCurrentLocationChosen] = useState(false);
	const [fromPlaceHolderText, setFromPlaceHolderText] = useState(fromRoomDefaultPlaceHolderText);

	const handleBuildingOptionSelect = useCallback(async (building, isStart) => {
		if (!building) {
			console.log("Not building");
			return;
		}

		console.log("!!!building: " + building);

		if (building == "Current Location") {
			console.log("Current Location");
			console.log(location);

			var GCS = {
				latitude: location.latitude,
				longitude: location.longitude,
			}

			// var testGCS = {
			// 	latitude: 41.0078998985986,
			// 	longitude: -76.44737043862342,
			// }

			let area = insideBuilding(GCS);
			console.log("Area: ", area);

			setCurrentLocationArea(area);
			setCurrentLocationChosen(true);
			setSelectedStartBuilding(area);
			setFromPlaceHolderText("Select Floor")

			getNumFloors(area).then((floorInformation) => {
				console.log("Num Floors: ", floorInformation);
				// setSelectedStartBuilding(area);
				var floors = [];
				let floor = "Floor ";
				for (let i = floorInformation.lowestFloor; i < floorInformation.lowestFloor + floorInformation.numFloors; i++) {
					if (i == -1) {
						floors.push(floor + "Basement");
					} else if (i == 0) {
						floors.push(floor + "Ground");
					}
					else {
						floors.push(floor + i);
					}
				}
				var floorType = (floor) => {
					return {
						name: floor
					}
				}

				let floorObjects = [];
				floors.forEach((floor) => {
					floorObjects.push(floorType(floor));
				})
				setFilteredStartRoomNumbers(floorObjects);
			})
		}

		else {
			//let poiId = pointsOfInterest.findIndex((p) => ("\u2605 " + p.name) == building)
			setFromPlaceHolderText(fromRoomDefaultPlaceHolderText);

			let poi = pointsOfInterest.find((p) => "\u2605 " + p.name == building);

			if (poi == null) {
				if (isStart) {
					setSelectedStartBuilding(building); // save destination building
					setSelectedStartRoom(null);
					setSelectedStartRoomId(null);
				} else {
					setSelectedEndBuilding(building);
					setSelectedEndRoom(null);
					setSelectedEndRoomId(null);
				}

			getRooms(building)
				.then((rooms) => {
					if (isStart)
						setFilteredStartRoomNumbers(
							rooms.filter((room) => room.name.toLowerCase())
						);
					else
						setFilteredEndRoomNumbers(
							rooms.filter((room) => room.name.toLowerCase())
						);
				})
				.catch((error) => {
					console.error("Error fetching rooms for building:", building, error);
				});
			} else {
				if (isStart) {
					setSelectedStartBuilding(poi.bldg);
					setSelectedStartRoom(poi.room);
					setSelectedStartRoomId(poi.locId);
				} else {
					setSelectedEndBuilding(poi.bldg);
					setSelectedEndRoom(poi.room);
					setSelectedEndRoomId(poi.locId);
				}
				
		}
	}});

	const displayPath = useCallback(async (pathData) => {
	var processedPath;

	console.log(pathData);

	if (pathData.message == "No Path Found!")
		throw new Error(pathData.message);

	processedPath = new ProcessedPath(pathData.path);

	console.log(processedPath.getStringRepresentation());

	var blueprintNames = processedPath.getBlueprintNames();
	var points = processedPath.getPoints();

	router.push({
		pathname: `/buildings/${blueprintNames[0]}`,
		params: {
		categories: JSON.stringify(blueprintNames),
		coords: JSON.stringify(points),
		currLoc: 0,
		maxLocs: blueprintNames.length - 1,
		},
	});
	});

	const findBathroom = useCallback(async (currLoc, gender) => {
	try {
		console.log("Current Location: ", currLoc);

		setBathroomPopupVisible(false);
		var pathData = await getNearestBathroom(currLoc, gender);

		console.log(pathData);

		await displayPath(pathData);
	} catch (e) { console.error("Error fetching path:", e); }
	});

	// set up a useEffect to request permissions, fetch user location, and track location
	useEffect(() => {
		// request user location to use while app is running
		async function getPermissionsAndStartWatching() {
			// wait until we get permission granted or denied
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.log("Permission not granted");
				return;
			}

			// Get initial location
			let currentLocation = await Location.getCurrentPositionAsync({}).then((location) => {
				console.log("initial Location: " + location.coords);
				
				setLocation(currentLocation.coords);
			})


			// Start watching position updates
			const newTracker = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,

					timeInterval: 10, // time in milliseconds
					distanceInterval: 1, // update after this many meters moved
				},
				(location_update) => {
					console.log('Updated location:', location_update.coords);
					setLocation(location_update.coords);
				}
			);

			setTracker(newTracker);
		}

		getPermissionsAndStartWatching();

		// Stop watching location when the app closes or user navigates to another screen
		return () => {
			if (subscription) {
				subscription.remove();
			}
		};
	}, []);

	// Handle region change only if the region hasn't been set yet
	const handleRegionChangeComplete = (newRegion) => {
		setRegion(newRegion);
	};

	// Update region with location data when it's available
	useEffect(() => {
		if (location && !isRegionSet) {
			const newRegion = {
				// latitude: location.latitude,
				// longitude: location.longitude,
				latitude: 41.007799728334525,
				longitude: -76.44851515601727,
				latitudeDelta: 0.00922,
				longitudeDelta: 0.00421,
			};
			setRegion(newRegion);
			setIsRegionSet(true); // Mark that the region is set
		}
	}, [location, isRegionSet]); // Ensure this runs only when the location is available

	// Get buildings when the program starts
	useEffect(() => {
		async function fetchBuildingSearchOptions() {
			try {
				let bldgs = (await getBuildings()).sort();
				let pois = (await getPois()).sort();

				setBuildingSearchOptions(
					bldgs
						.map((building) => building.name)
						.concat(pois.map((poi) => "\u2605 " + poi.name))
				);
				setPointsOfInterest(pois);
			} catch (e) {
				console.error("Error fetching building search options: ", e);
			}
		}

		fetchBuildingSearchOptions();
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar hidden={true} />

			{/* Text above search bars*/}
			<View style={styles.textBox}>
				<Text style={styles.text}>RoonGO</Text>
			</View>

			<MapView
				style={styles.map}
				region={region} // Directly control region without initialRegion
				// minZoomLevel={16} // Ensure minimum zoom level is appropriate
				onRegionChangeComplete={handleRegionChangeComplete} // update the zoom level when the user changes it
				minZoomLevel={16}
			>
				{/* Marker showing the User's location */}
				{location && (
					<Marker
						coordinate={{
							latitude: location.latitude,
							longitude: location.longitude,
						}}
					>
						<Image
							source={require("../../assets/cropped-huskie.png")}
							style={{ height: 40, width: 40 }}
						/>
					</Marker>
				)}
			</MapView>
			
			<View style={styles.searchButtonContainer}>
				<ImageButton
					selected={selectedStartRoomId != null}
					onPress={() => setBathroomPopupVisible(true)}
					imagePath={require("../../assets/bathroom_sign.png")}
					customStyles={{ height: 44, width: 44 }}
					disabled={selectedStartRoomId == null}
				/>
				{/* Search Button */}
				<Pressable
					style={styles.button}
					onPress={() => {
						// Check if all necessary values are set
						if (
							true
							// selectedStartBuilding !== null &&
							// selectedStartRoom !== null &&
							// selectedEndBuilding !== null &&
							// selectedEndRoom !== null
						) {
							console.log("Not null");

							async function getPath() {
								try {
									// Create array of room IDs: [fromRoomId, toRoomId]
									const roomIdArray = [selectedStartRoomId, selectedEndRoomId];
									// const roomIdArray = [22, 1078];

									console.log("Room ID array: ", roomIdArray);
									console.log("Accessible Path Mode: ", accessiblePathMode);

									var pathData = await findPath(roomIdArray[0], roomIdArray[1], accessiblePathMode);

									console.log(pathData);

									await displayPath(pathData);
								} catch (e) {
									console.error("Error fetching path:", e);
								}
							}

							getPath();
						} else {
							console.log("One or more values are null");
						}
					}}
				>
					<Text style={styles.buttonText}>Search</Text>
				</Pressable>
			</View>
			

			{/* Search bar with first being for building and second for room number */}
			{/* "From" Building Search Bar */}
			<SearchBar
				searchFilterData={buildingSearchOptions} // options for buildings
				defaultFilterData={["Current Location", "🏫 Special Building 2"]} // add default "from" options here
				customStyles={{ left: "5%", width: "60%", zIndex: 2 }}
				placeholderText="From"
				onTypingChange={setIsBuildingTyping} // updates typing state if needed
				onSelect={(building) => handleBuildingOptionSelect(building, true)}
			/>

			{/* "From" Room Search Bar */}
			<SearchBar
				customStyles={{
					width: "31%",
					left: "64%",
					borderColor: "black",
					zIndex: 2,
				}}
				showIcon={false}
				searchFilterData={filteredRoomNumbers.map((r) => r.name)} // show only room names in dropdown
				searchFilterStyles={{ width: "100%" }}
				placeholderText={fromPlaceHolderText}
				onTypingChange={setIsRoomTyping}
				onSelect={(selectedName) => {
					if (currentLocationChosen) {
						let b = currentLocationArea;
						let floorLabel = selectedName[selectedName.length - 1];
						let floor;
						if (floorLabel == 'b') {
							floor = -1;
						} else if (floorLabel == 'g') {
							floor = 0;
						} else {
							floor = floorLabel;
						}

						getClosedLocationIdFromBuildingNameFloorNumberAndGCSCoordinates(
							{
								"building": b,
								"floor": floor,
							},
							{
								"latitude": location.latitude,
								"longitude": location.longitude,
							}).then(id => {
								setSelectedStartRoomId(id);
							})
					} else {
						// Find the full room object matching the selected name
						const matched = filteredRoomNumbers.find(
							(room) => room.name === selectedName
						);
						if (matched) {
							setSelectedStartRoom(matched.name); // save room name
							setSelectedStartRoomId(matched.id); // save room id
							console.log("Selected room:", matched.name, "| ID:", matched.id);
						}
					}

				}}
			/>

			{/* "To" Building Search Bar */}
			<SearchBar
				searchFilterData={buildingSearchOptions} // same list of buildings
				customStyles={{ top: "16%", left: "5%", width: "60%" }}
				placeholderText="To"
				onSelect={(building) => handleBuildingOptionSelect(building, false)}
			/>
			{/* "To" Building Search Bar */}
			<SearchBar
				searchFilterData={buildingSearchOptions} // same list of buildings
				customStyles={{ top: "16%", left: "5%", width: "60%" }}
				placeholderText="To"
				onSelect={(building) => handleBuildingOptionSelect(building, false)}
			/>

			{/* "To" Room Search Bar */}
			<SearchBar
				customStyles={{
					top: "16%",
					width: "31%",
					left: "64%",
					borderColor: "black",

				}}
				showIcon={false}
				searchFilterData={filteredEndRoomNumbers.map((r) => r.name)} // only names in dropdown
				searchFilterStyles={{ width: "100%", }}
				placeholderText="Room #"
				onSelect={(selectedName) => {
					// Find the full room object from the selected name
					const matched = filteredEndRoomNumbers.find(
						(room) => room.name === selectedName
					);
					if (matched) {
						setSelectedEndRoom(matched.name); // save destination room name
						setSelectedEndRoomId(matched.id); // save its ID
						console.log("Selected TO room:", matched.name, "| ID:", matched.id);
					}
				}}
			/>

			<PopupDialog
				visible={bathroomPopupVisible}
				onClose={() => setBathroomPopupVisible(false)}
				content={
					<View style={styles.popupContainer}>
						<View style={styles.popupRow}>
							<ImageButton
								selected={ true }
								onPress={() => {findBathroom(selectedStartRoomId, "F")}}
								imagePath={require("../../assets/woman_gender_symbol_white.png")}
								customStyles={styles.bathroomButton}
							/>
							<ImageButton
								selected={ true }
								onPress={() => {findBathroom(selectedStartRoomId, "A")}}
								imagePath={require("../../assets/third_gender_symbol_white.png")}
								customStyles={styles.bathroomButton}
							/>
						</View>
						<View style={styles.popupRow}>
							<ImageButton
								selected={ true }
								onPress={() => {findBathroom(selectedStartRoomId, "N")}}
								imagePath={require("../../assets/all_gender_symbol_white.png")}
								customStyles={styles.bathroomButton}
							/>
							<ImageButton
								selected={ true }
								onPress={() => {findBathroom(selectedStartRoomId, "M")}}
								imagePath={require("../../assets/man_gender_symbol_white.png")}
								customStyles={styles.bathroomButton}
							/>
						</View>
					</View>
			}/>

			<ImageButton
				selected={accessiblePathMode}
				onPress={() => setAccessiblePathMode(!accessiblePathMode)}
				imagePath={require("../../assets/handicap_accessible_icon.jpg")}
				customStyles={styles.accessibleButton}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
	},
	popupContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 'auto'
	},
	popupRow: {
		flexDirection: 'row',
		gap: 16,
		padding: 16
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	textBox: {
		position: "absolute",
		top: 40,
		justifyContent: "center",
		backgroundColor: "#f1f1f1",
		padding: 10,
		borderRadius: 5,
		// zIndex: 10, // Ensures it stays on top of other content
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	button: {
		backgroundColor: "white",
		paddingVertical: 10,
		paddingHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 5,
		borderColor: "black",
		borderWidth: 2,
	},
	buttonText: {
		color: "grey",
		fontSize: 18,
		fontWeight: "bold",
		marginLeft: 10,
	},
	searchButtonContainer: {
		flexDirection: 'row',
		gap: 10,
		position: 'absolute',
		right: '5%',
		top: '24%'
	},
	bathroomButton: {
		height: 60,
		width: 60,
		backgroundColor: '#005084'
	},
	accessibleButton: {
		position: "absolute",
		bottom: "5%",
		right: "5%",
		height: 70,
		width: 70 }
});
