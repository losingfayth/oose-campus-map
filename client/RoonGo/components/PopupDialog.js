import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

const PopupDialog = ({ visible, content, onClose }) => {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
				<TouchableWithoutFeedback onPress={onClose}>
					<View style={styles.overlay}>
						<TouchableWithoutFeedback>
							<View style={styles.container}>
								{content}
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 0,
		width: 'auto',
		height: 'auto'
		// Prevent clicks from passing through to overlay
	},
});

export default PopupDialog;