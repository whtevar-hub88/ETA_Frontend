// File: app.config.ts

import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Expense Tracker",
    slug: "expanse_tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/app-icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#7A9E7E",
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.yourname.expensetracker",
    },
    android: {
        package: "com.yourname.expensetracker",
        adaptiveIcon: {
            foregroundImage: "./assets/icons/adaptive-icon.png",
            backgroundColor: "#7A9E7E",
        },
    },
    web: {
        favicon: "./assets/icons/favicon.png",
    },
    extra: {
        eas: {
            projectId: "your-eas-project-id",
        },
    },
});
