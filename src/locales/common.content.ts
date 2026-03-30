import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const translation = {
    key: "common",
    content: {
        home: {
            title: t({
                en: "Home",
                "zh-HK": "首頁",
            }),
        },
        settings: {
            title: t({
                en: "Settings",
                "zh-HK": "設定",
            }),
            lang: {
                title: t({
                    en: "Language",
                    "zh-HK": "語言",
                }),
            },
            theme: {
                title: t({
                    en: "Theme",
                    "zh-HK": "主題",
                }),
                system: t({
                    en: "Follow System",
                    "zh-HK": "跟隨系統",
                }),
                light: t({
                    en: "Light Theme",
                    "zh-HK": "淺色主題",
                }),
                dark: t({
                    en: "Dark Theme",
                    "zh-HK": "深色主題",
                }),
            },
        },
    },
} as const satisfies Dictionary;

export default translation;
