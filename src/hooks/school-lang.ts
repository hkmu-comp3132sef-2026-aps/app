import { useLocale } from "react-intlayer";

import { SchoolLang } from "#/graphql";

const useSchoolLang = (): SchoolLang => {
    const { locale } = useLocale();

    switch (locale) {
        case "zh-HK":
            return SchoolLang.ZH_HANT;
        default:
            return SchoolLang.EN;
    }
};

export { useSchoolLang };
