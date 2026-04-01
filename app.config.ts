import "tsx/cjs";

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
            "@maplibre/maplibre-react-native",
        ],
    ],
    extra: {
        eas: {
            projectId: "92103542-3e49-41b2-9138-0d759aa8db12",
        },
    },
};

export default config;
