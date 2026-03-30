import { getLocaleFromStorageClient, type Locale } from "intlayer";

import { SchoolLang } from "#/graphql";

const getSchoolLang = (): SchoolLang => {
    const locale: Locale | undefined = getLocaleFromStorageClient({});

    if (!locale) return SchoolLang.EN;

    switch (locale) {
        case "zh-HK":
            return SchoolLang.ZH_HANT;
        default:
            return SchoolLang.EN;
    }
};

export { getSchoolLang };
