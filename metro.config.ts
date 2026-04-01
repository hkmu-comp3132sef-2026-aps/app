import type { MetroConfig } from "@expo/metro/metro-config/types";

import { toMerged } from "es-toolkit";
import { getDefaultConfig } from "expo/metro-config";
import { configMetroIntlayerSync } from "react-native-intlayer/metro";

const config: MetroConfig = {};

module.exports = configMetroIntlayerSync(
    toMerged(getDefaultConfig(__dirname), config),
);
