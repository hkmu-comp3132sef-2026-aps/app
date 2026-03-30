const { toMerged } = require("es-toolkit");
const { getDefaultConfig } = require("expo/metro-config");
const { configMetroIntlayerSync } = require("react-native-intlayer/metro");

const dConfig = getDefaultConfig(__dirname);

/** @type {Partial<ReturnType<typeof getDefaultConfig>>} */
const config = {
    /** ... */
};

module.exports = configMetroIntlayerSync(toMerged(dConfig, config));
