import React from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';

const ImageButton = ({ onPress, imagePath, selected, customStyles, label, disabled }) => {
	return (
		<Pressable onPress={onPress} style={[styles.button, customStyles]} disabled = {disabled}>
			<Image
				source={imagePath}
				style={[
					styles.image,
					{ opacity: selected ? 1 : (disabled ? 0.1 : 0.6) },
					customStyles
				]}
			/>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 10
		// Add other styling for your button container
	},
	image: {
		borderRadius: 10,
		// Add other styling for your image
	}
});

export default ImageButton;