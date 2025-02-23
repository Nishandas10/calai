import Constants from "expo-constants";

// Get the environment variables
const ENV = {
    FIREBASE_API_KEY: Constants.manifest?.extra?.FIREBASE_API_KEY ??
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: Constants.manifest?.extra?.FIREBASE_AUTH_DOMAIN ??
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: Constants.manifest?.extra?.FIREBASE_PROJECT_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET:
        Constants.manifest?.extra?.FIREBASE_STORAGE_BUCKET ??
            process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID:
        Constants.manifest?.extra?.FIREBASE_MESSAGING_SENDER_ID ??
            process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: Constants.manifest?.extra?.FIREBASE_APP_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID:
        Constants.manifest?.extra?.FIREBASE_MEASUREMENT_ID ??
            process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export default ENV;
