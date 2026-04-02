import type { StorageValue } from "unstorage";

import type {
    MapFeature,
    MapFeatureProperties,
    MapSourceData,
    PaginationState,
    SchoolLang,
} from "#/modules/home/components/map/@types";

import { storage } from "#/configs/unstorage";

const SCHOOLS_CACHE_KEY_PREFIX = "home:map:schools" as const;
const SCHOOLS_CACHE_TTL_MS = 86_400_000 as const;
const SCHOOLS_CACHE_VERSION = 1 as const;

type CachedSchoolMapData = {
    version: number;
    cachedAt: number;
    totalCount: number;
    source: MapSourceData;
};

type CachedSchoolMapSnapshot = {
    isFresh: boolean;
    pagination: PaginationState;
    sourceData: MapSourceData;
};

type PersistCachedSchoolMapDataArgs = {
    lang: SchoolLang;
    sourceData: MapSourceData;
    totalCount: number;
};

const getSchoolsCacheKey = (lang: SchoolLang): string => {
    return `${SCHOOLS_CACHE_KEY_PREFIX}:${lang}`;
};

const isNonNegativeNumber = (value: unknown): value is number => {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

const isCoordinates = (
    value: unknown,
): value is [
    number,
    number,
] => {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number"
    );
};

const isMapFeatureProperties = (
    value: unknown,
): value is MapFeatureProperties => {
    if (!value || typeof value !== "object") return false;

    return (
        typeof (
            value as {
                schoolId?: unknown;
            }
        ).schoolId === "string"
    );
};

const isMapFeature = (value: unknown): value is MapFeature => {
    if (!value || typeof value !== "object") return false;

    const feature = value as {
        type?: unknown;
        properties?: unknown;
        geometry?: {
            type?: unknown;
            coordinates?: unknown;
        };
    };

    return (
        feature.type === "Feature" &&
        isMapFeatureProperties(feature.properties) &&
        feature.geometry?.type === "Point" &&
        isCoordinates(feature.geometry.coordinates)
    );
};

const isMapSourceData = (value: unknown): value is MapSourceData => {
    if (!value || typeof value !== "object") return false;

    const sourceData = value as {
        type?: unknown;
        features?: unknown;
    };

    return (
        sourceData.type === "FeatureCollection" &&
        Array.isArray(sourceData.features) &&
        sourceData.features.every(isMapFeature)
    );
};

const isCachedSchoolMapData = (
    value: unknown,
): value is CachedSchoolMapData => {
    if (!value || typeof value !== "object") return false;

    const cacheData = value as {
        version?: unknown;
        cachedAt?: unknown;
        totalCount?: unknown;
        source?: unknown;
    };

    return (
        cacheData.version === SCHOOLS_CACHE_VERSION &&
        isNonNegativeNumber(cacheData.cachedAt) &&
        isNonNegativeNumber(cacheData.totalCount) &&
        isMapSourceData(cacheData.source)
    );
};

const getCachedSchoolMapData = async (
    lang: SchoolLang,
): Promise<CachedSchoolMapSnapshot | null> => {
    try {
        const value: StorageValue = await storage.getItem(
            getSchoolsCacheKey(lang),
        );

        if (!isCachedSchoolMapData(value)) return null;

        return {
            isFresh: Date.now() - value.cachedAt <= SCHOOLS_CACHE_TTL_MS,
            pagination: {
                endCursor: void 0,
                hasNextPage: false,
                loadedCount: value.source.features.length,
                totalCount: Math.max(
                    value.totalCount,
                    value.source.features.length,
                ),
            },
            sourceData: value.source,
        };
    } catch {
        return null;
    }
};

const persistCachedSchoolMapData = async ({
    lang,
    sourceData,
    totalCount,
}: PersistCachedSchoolMapDataArgs): Promise<void> => {
    if (sourceData.features.length === 0) return void 0;

    try {
        const payload: CachedSchoolMapData = {
            version: SCHOOLS_CACHE_VERSION,
            cachedAt: Date.now(),
            totalCount: Math.max(totalCount, sourceData.features.length),
            source: sourceData,
        };

        await storage.setItem(getSchoolsCacheKey(lang), payload);
    } catch {
        // Ignore storage failures
    }
};

export type { CachedSchoolMapSnapshot };
export { getCachedSchoolMapData, persistCachedSchoolMapData };
