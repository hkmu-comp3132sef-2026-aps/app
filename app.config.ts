import "ts-node/register";

import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
    name: "SCH",
    slug: "sch",
    scheme: "sch",
    owner: "alpheusmtx",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/icons/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
        image: "./src/assets/icons/splash.png",
        resizeMode: "contain",
        backgroundColor: "#fff",
    },
    assetBundlePatterns: [
        "**/*",
    ],
    web: {
        bundler: "metro",
        output: "single",
        favicon: "./src/assets/icons/favicon.png",
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "day.alpheus.sch",
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./src/assets/icons/foreground.png",
            backgroundColor: "#fff",
        },
        package: "day.alpheus.sch",
        versionCode: 1,
    },
    experiments: {
        tsconfigPaths: true,
        typedRoutes: true,
        reactCompiler: true,
    },
    plugins: [
        [
            "expo-router",
        ],
        [
            "expo-build-properties",
            {
                android: {
                    // Android 16.0 (2025-06-10)
                    compileSdkVersion: 36,
                    targetSdkVersion: 36,
                    buildToolsVersion: "36.0.0",
                    // Android 7.0+ (2016-08-22)
                    minSdkVersion: 24,
                },
                ios: {
                    // iOS 15.1+ (2021-09-20)
                    deploymentTarget: "15.1",
                },
            },
        ],
    ],
};

export default config;
