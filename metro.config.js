const { toMerged } = require("es-toolkit");
const { getDefaultConfig } = require("expo/metro-config");
const { configMetroIntlayer } = require("react-native-intlayer/metro");

module.exports = (async () => {
    const dConfig = getDefaultConfig(__dirname);

    /** @type {Partial<ReturnType<typeof getDefaultConfig>>} */
    const config = {
        /** ... */
    };

    return await configMetroIntlayer(toMerged(dConfig, config));
})();
