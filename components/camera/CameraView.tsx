import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface CameraViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CameraView({ isVisible, onClose }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  if (!isVisible) {
    return null;
  }

  // If permission is null, the system will automatically request it
  if (!permission?.granted) {
    requestPermission();
    return null;
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ExpoCameraView style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => {
                // Placeholder for capture functionality
                console.log('Capture photo');
              }}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </ExpoCameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  flipButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    alignSelf: 'flex-end',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'white',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
}); 