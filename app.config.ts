import { ExpoConfig } from "expo/config";

// Read from the .env file
require("dotenv").config();

export default {
  name: "CalAI",
  slug: "CalAI",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/splash-screen.png",
  backgroundColor: "#000000",
  splash: {
    image: "./assets/images/splash-screen.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  scheme: "calai",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-screen.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
    "expo-secure-store",
    [
      "expo-camera",
      {
        cameraPermission: "Allow $CalAI to access your camera.",
      },
    ],
    "expo-barcode-scanner",
  ],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
    package: "com.anonymous.CalAI",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    build: {
      babel: {
        include: ["@expo/vector-icons"],
      },
    },
  },
} satisfies ExpoConfig;
