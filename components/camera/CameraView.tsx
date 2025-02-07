import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Alert, Image } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { uploadFoodImage } from '@/lib/services/storage';
import { analyzeFoodImage, type FoodAnalysis } from '@/lib/services/food-analysis';
import * as ImageManipulator from 'expo-image-manipulator';
import FoodAnalysisCard from '../food/FoodAnalysisCard';

interface CameraViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CameraView({ isVisible, onClose }: CameraViewProps) {
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
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
    if (!cameraRef.current || isCapturing) return;

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

      setPreviewImage(manipulatedImage.uri);
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAccept = async () => {
    if (!previewImage || !session?.user?.id) return;

    try {
      setIsCapturing(true);
      
      // Upload to Supabase storage
      const imageUrl = await uploadFoodImage(previewImage, session.user.id);
      console.log('Image uploaded successfully:', imageUrl);

      // Get the relative path from the full URL
      const url = new URL(imageUrl);
      const path = url.pathname.split('/').slice(-2).join('/');
      setImagePath(path);

      // Analyze the food image
      const foodAnalysis = await analyzeFoodImage(path);
      setAnalysis(foodAnalysis);

    } catch (error) {
      console.error('Error processing photo:', error);
      Alert.alert('Error', 'Failed to process photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    setAnalysis(null);
  };

  const handleDone = () => {
    onClose();
    // Reset state
    setPreviewImage(null);
    setAnalysis(null);
    setImagePath(null);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {previewImage ? (
          // Preview Screen
          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
            
            {analysis && imagePath ? (
              // Analysis Results
              <>
                <FoodAnalysisCard 
                  analysis={analysis} 
                  imagePath={imagePath} 
                  onSave={handleDone}
                />
                <TouchableOpacity
                  style={[styles.doneButton]}
                  onPress={handleDone}
                  disabled={isCapturing}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              // Accept/Retake Buttons
              <View style={styles.previewButtons}>
                <TouchableOpacity
                  style={[styles.previewButton, styles.retakeButton]}
                  onPress={handleRetake}
                  disabled={isCapturing}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewButton, styles.acceptButton]}
                  onPress={handleAccept}
                  disabled={isCapturing}
                >
                  <Ionicons name="checkmark" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          // Camera Screen
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
        )}
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
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    height: '50%',
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  doneButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 