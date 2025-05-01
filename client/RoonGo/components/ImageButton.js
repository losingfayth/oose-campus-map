import React from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';

const ImageButton = ({ onPress, imagePath, selected, customStyles }) => {
	return (
		<Pressable onPress={onPress} style={[styles.button, customStyles]}>
			<Image
				source={imagePath}
				style={[
					styles.image,
					{ opacity: selected ? 1 : 0.5 },
					customStyles
				]}
			/>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	button: {
		padding: 10,
		borderRadius: 10
		// Add other styling for your button container
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: 10
		// Add other styling for your image
	}
});

export default ImageButton;