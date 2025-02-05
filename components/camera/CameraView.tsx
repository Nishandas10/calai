import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { uploadFoodImage } from '@/lib/services/storage';
import * as ImageManipulator from 'expo-image-manipulator';

interface CameraViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CameraView({ isVisible, onClose }: CameraViewProps) {
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<ExpoCameraView>(null);

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

  const handleCapture = async () => {
    if (!cameraRef.current || !session?.user?.id || isCapturing) return;

    try {
      setIsCapturing(true);
      
      // Take the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Compress and resize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Upload to Supabase storage
      const imageUrl = await uploadFoodImage(manipulatedImage.uri, session.user.id);
      console.log('Image uploaded successfully:', imageUrl);

      // Close camera after successful upload
      onClose();
      Alert.alert('Success', 'Photo captured and uploaded successfully!');
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture and upload photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ExpoCameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              disabled={isCapturing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.buttonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isCapturing}
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
  buttonDisabled: {
    opacity: 0.5,
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