import type { LocalesValues } from "intlayer";

import { getLocales } from "expo-localization";

const DEFAULT_LOCALE: LocalesValues = "en";

const CHINESE_HONG_KONG_LOCALE: LocalesValues = "zh-HK";

const resolveSupportedLocale = (
    languageTag: string | null | undefined,
    languageCode: string | null | undefined,
): LocalesValues => {
    if (languageTag === CHINESE_HONG_KONG_LOCALE) {
        return CHINESE_HONG_KONG_LOCALE;
    }

    if (languageTag?.startsWith("zh-") || languageCode === "zh") {
        return CHINESE_HONG_KONG_LOCALE;
    }

    return DEFAULT_LOCALE;
};

const getDeviceLocale = (): LocalesValues => {
    const locale = getLocales()[0];

    return resolveSupportedLocale(locale?.languageTag, locale?.languageCode);
};

export { getDeviceLocale, resolveSupportedLocale };
