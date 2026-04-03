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
            search: {
                title: t({
                    en: "Search",
                    "zh-HK": "搜尋",
                }),
                loading: t({
                    en: "Searching schools...",
                    "zh-HK": "正在搜尋學校...",
                }),
                empty: t({
                    en: "No schools found.",
                    "zh-HK": "找不到符合條件的學校。",
                }),
            },
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
        schools: {
            detail: {
                title: t({
                    en: "School Details",
                    "zh-HK": "學校詳情",
                }),
                schoolIdLabel: t({
                    en: "School ID",
                    "zh-HK": "學校編號",
                }),
                unavailable: t({
                    en: "Not available",
                    "zh-HK": "未提供",
                }),
                missingIdTitle: t({
                    en: "Missing school ID",
                    "zh-HK": "缺少學校編號",
                }),
                missingIdDescription: t({
                    en: "This page cannot load school details because the route did not include a school ID.",
                    "zh-HK": "未能載入學校資料，因為路由參數中沒有學校編號。",
                }),
                loadingTitle: t({
                    en: "Loading school details",
                    "zh-HK": "正在載入學校資料",
                }),
                loadingDescription: t({
                    en: "Please wait while we load this school's information.",
                    "zh-HK": "正在載入這間學校的資料，請稍候。",
                }),
                notFoundTitle: t({
                    en: "School not found",
                    "zh-HK": "找不到學校",
                }),
                notFoundDescription: t({
                    en: "We could not load details for this school right now. Please try again later.",
                    "zh-HK": "目前未能取得這間學校的資料，請稍後再試。",
                }),
                noDetails: t({
                    en: "No school details are available for this record.",
                    "zh-HK": "目前沒有可顯示的學校資料。",
                }),
                sections: {
                    profile: t({
                        en: "Profile",
                        "zh-HK": "學校資料",
                    }),
                    contact: t({
                        en: "Contact",
                        "zh-HK": "聯絡資料",
                    }),
                    coordinates: t({
                        en: "Coordinates",
                        "zh-HK": "座標",
                    }),
                },
                fields: {
                    category: t({
                        en: "Category",
                        "zh-HK": "類別",
                    }),
                    level: t({
                        en: "Level",
                        "zh-HK": "級別",
                    }),
                    district: t({
                        en: "District",
                        "zh-HK": "地區",
                    }),
                    financeType: t({
                        en: "Finance Type",
                        "zh-HK": "資助類別",
                    }),
                    session: t({
                        en: "Session",
                        "zh-HK": "授課時段",
                    }),
                    studentsGender: t({
                        en: "Students Gender",
                        "zh-HK": "學生性別",
                    }),
                    language: t({
                        en: "Language",
                        "zh-HK": "授課語言",
                    }),
                    address: t({
                        en: "Address",
                        "zh-HK": "地址",
                    }),
                    telephone: t({
                        en: "Telephone",
                        "zh-HK": "電話",
                    }),
                    fax: t({
                        en: "Fax",
                        "zh-HK": "傳真",
                    }),
                    latitude: t({
                        en: "Latitude",
                        "zh-HK": "緯度",
                    }),
                    longitude: t({
                        en: "Longitude",
                        "zh-HK": "經度",
                    }),
                    easting: t({
                        en: "Easting",
                        "zh-HK": "東坐標",
                    }),
                    northing: t({
                        en: "Northing",
                        "zh-HK": "北坐標",
                    }),
                },
            },
        },
    },
} as const satisfies Dictionary;

export default translation;
