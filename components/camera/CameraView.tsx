import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Alert, Image, Animated, Text } from 'react-native';
import { Camera, CameraView as ExpoCameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { uploadFoodImage } from '@/lib/services/storage';
import { analyzeFoodImage, type FoodAnalysis } from '@/lib/services/food-analysis';
import { getProductByBarcode, saveProductToDatabase } from '@/lib/services/food-database';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import FoodAnalysisCard from '../food/FoodAnalysisCard';
import type { FlashMode } from 'expo-camera';

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
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<ExpoCameraView>(null);
  const lastScanTime = useRef<number>(0);
  const scanTimeout = useRef<NodeJS.Timeout>();
  const scanAttempts = useRef<number>(0);

  // Reset scanner state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      resetScannerState();
    }
  }, [isVisible]);

  // Cleanup timeouts and animations
  useEffect(() => {
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
      scanLineAnim.stopAnimation();
      resetScannerState();
    };
  }, []);

  // Function to reset all scanner-related state
  const resetScannerState = () => {
    setScannedBarcode(null);
    setIsScanning(false);
    lastScanTime.current = 0;
    scanAttempts.current = 0;
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    scanLineAnim.setValue(0);
  };

  // Update toggleScanMode to properly handle mode switching
  const toggleScanMode = () => {
    // Clear any existing timeouts and reset scan-related state
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    setScannedBarcode(null);
    setIsScanning(false);
    lastScanTime.current = 0;
    scanAttempts.current = 0;
    
    // Toggle the scanning mode
    setIsScanningBarcode(prev => !prev);
  };

  // Add scanning animation
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }

    return () => {
      scanLineAnim.stopAnimation();
    };
  }, [isScanning]);

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

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
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
    resetScannerState();
    onClose();
    setPreviewImage(null);
    setAnalysis(null);
    setImagePath(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  // Update barcode scanning handler with delay, debounce, and retry logic
  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    const now = Date.now();
    const SCAN_DELAY = 2000; // 2 seconds between scans
    const MAX_ATTEMPTS = 3; // Maximum number of scan attempts before showing error
    
    if (scannedBarcode || !isScanningBarcode || !session?.user?.id) return;
    if (now - lastScanTime.current < SCAN_DELAY) return;
    
    lastScanTime.current = now;
    setScannedBarcode(data);
    setIsScanning(true);
    scanAttempts.current += 1;

    // Clear any existing timeout
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    
    try {
      const productData = await getProductByBarcode(data);
      
      // Download and store the product image if available
      let storedImagePath = null;
      if (productData.product.image_url) {
        try {
          // Download the image to local filesystem first
          const filename = `${Date.now()}.jpg`;
          const localUri = `${FileSystem.cacheDirectory}${filename}`;
          
          const downloadResult = await FileSystem.downloadAsync(
            productData.product.image_url,
            localUri
          );
          
          if (downloadResult.status === 200) {
            // Process the image with ImageManipulator
            const manipResult = await ImageManipulator.manipulateAsync(
              localUri,
              [{ resize: { width: 1080 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            
            // Upload the processed image to Supabase storage and get the path
            const uploadedUrl = await uploadFoodImage(manipResult.uri, session.user.id);
            // Extract just the path part from the full URL
            const urlObj = new URL(uploadedUrl);
            storedImagePath = urlObj.pathname.split('/').slice(-2).join('/');
            
            // Clean up the temporary file
            await FileSystem.deleteAsync(localUri, { idempotent: true });
            await FileSystem.deleteAsync(manipResult.uri, { idempotent: true });
            
            console.log('Product image stored successfully:', storedImagePath);
          }
        } catch (imageError) {
          console.error('Error storing product image:', imageError);
          // Continue with the process even if image storage fails
        }
      }
      
      const savedProduct = await saveProductToDatabase(productData);
      
      // Reset scan attempts on success
      scanAttempts.current = 0;
      
      // Convert product data to FoodAnalysis format
      const analysis: FoodAnalysis = {
        ingredients: [{
          name: productData.product.product_name,
          calories: Math.round(productData.product.nutriments['energy-kcal_100g'] || 0),
          protein: Number((productData.product.nutriments.proteins_100g || 0).toFixed(1)),
          carbs: Number((productData.product.nutriments.carbohydrates_100g || 0).toFixed(1)),
          fat: Number((productData.product.nutriments.fat_100g || 0).toFixed(1))
        }],
        total: {
          calories: Math.round(productData.product.nutriments['energy-kcal_100g'] || 0),
          protein: Number((productData.product.nutriments.proteins_100g || 0).toFixed(1)),
          carbs: Number((productData.product.nutriments.carbohydrates_100g || 0).toFixed(1)),
          fat: Number((productData.product.nutriments.fat_100g || 0).toFixed(1))
        }
      };
      
      setAnalysis(analysis);
      // Use the stored image path if available, otherwise fallback to the original URL
      const finalImagePath = storedImagePath || productData.product.image_url;
      setImagePath(finalImagePath);
      setPreviewImage(storedImagePath 
        ? supabase.storage.from('food-images').getPublicUrl(storedImagePath).data.publicUrl 
        : productData.product.image_url
      );
      
      // Save to food_logs table
      try {
        const { error: logError } = await supabase
          .from('food_logs')
          .insert({
            user_id: session.user.id,
            image_path: finalImagePath,
            ai_analysis: analysis,
            user_adjustments: null,
            created_at: new Date().toISOString()
          });

        if (logError) throw logError;
      } catch (logError) {
        console.error('Error saving to food logs:', logError);
        // Continue even if logging fails
      }
      
    } catch (error) {
      // Only show error dialog if we've reached max attempts
      if (scanAttempts.current >= MAX_ATTEMPTS) {
        scanTimeout.current = setTimeout(() => {
          if (error instanceof Error) {
            switch (error.message) {
              case "PRODUCT_NOT_FOUND":
                Alert.alert(
                  'Product Not Found',
                  'This product was not found in our database. Please try scanning another product.',
                  [{ 
                    text: 'OK', 
                    onPress: () => {
                      setScannedBarcode(null);
                      scanAttempts.current = 0;
                    }
                  }]
                );
                break;
              case "INVALID_PRODUCT_DATA":
                Alert.alert(
                  'Invalid Product Data',
                  'The product was found but has incomplete nutritional information.',
                  [{ text: 'OK', onPress: () => setScannedBarcode(null) }]
                );
                break;
              case "TIMEOUT":
                Alert.alert(
                  'Connection Timeout',
                  'The request took too long. Please check your internet connection and try again.',
                  [{ text: 'OK', onPress: () => setScannedBarcode(null) }]
                );
                break;
              case "TOO_MANY_REQUESTS":
                Alert.alert(
                  'Too Many Requests',
                  'Please wait a moment before scanning again.',
                  [{ text: 'OK', onPress: () => setScannedBarcode(null) }]
                );
                break;
              default:
                Alert.alert(
                  'Error',
                  'Failed to scan product. Please try again.',
                  [{ text: 'OK', onPress: () => setScannedBarcode(null) }]
                );
            }
          }
        }, 1500);
      } else {
        // If we haven't reached max attempts, just reset the scanned barcode
        setScannedBarcode(null);
      }
    } finally {
      setIsScanning(false);
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
        {previewImage ? (
          // Preview Screen with improved UI
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
              // Improved Accept/Retake UI
              <View style={styles.previewOverlay}>
                <View style={styles.previewButtons}>
                  <TouchableOpacity
                    style={[styles.previewButton, styles.retakeButton]}
                    onPress={handleRetake}
                    disabled={isCapturing}
                  >
                    <Ionicons name="refresh" size={24} color="white" />
                    <Text style={styles.buttonText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewButton, styles.acceptButton]}
                    onPress={handleAccept}
                    disabled={isCapturing}
                  >
                    <Ionicons name="checkmark" size={24} color="white" />
                    <Text style={styles.buttonText}>Use Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          // Enhanced Camera Screen
          <ExpoCameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8'],
            }}
            onBarcodeScanned={isScanningBarcode ? handleBarcodeScanned : undefined}
          >
            {/* Scanner Overlay */}
            <View style={styles.scannerOverlay}>
              <View style={[
                styles.scannerFrame,
                isScanningBarcode && styles.barcodeScannerFrame
              ]}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, isScanningBarcode ? 100 : 300]
                        })
                      }]
                    }
                  ]}
                />
              </View>
              {isScanningBarcode && (
                <Text style={styles.scannerText}>
                  Position barcode within the frame
                </Text>
              )}
            </View>
            
            <View style={styles.controlsContainer}>
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFlash}
                >
                  <Ionicons 
                    name={flashMode === 'off' ? "flash-off" : "flash"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomControls}>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickImage}
                >
                  <Ionicons name="images" size={30} color="white" />
                </TouchableOpacity>
                {!isScanningBarcode && (
                  <TouchableOpacity
                    style={[styles.captureButton, isCapturing && styles.buttonDisabled]}
                    onPress={handleCapture}
                    disabled={isCapturing}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.scanButton, isScanningBarcode && styles.scanButtonActive]}
                  onPress={toggleScanMode}
                >
                  <Ionicons 
                    name={isScanningBarcode ? "camera" : "barcode"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
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
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#2f95dc',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#2f95dc',
  },
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 44,
    height: 44,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  buttonText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
  },
  barcodeScannerFrame: {
    width: 280,
    height: 100,
    borderColor: '#2f95dc',
  },
  scannerText: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#2f95dc',
  },
}); 