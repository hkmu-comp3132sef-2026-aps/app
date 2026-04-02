import type { StorageValue } from "unstorage";

import type { School, SchoolLang } from "#/graphql";

import { storage } from "#/configs/unstorage";

const SCHOOL_DETAIL_CACHE_KEY_PREFIX = "schools:detail" as const;
const SCHOOL_DETAIL_CACHE_TTL_MS = 86_400_000 as const;
const SCHOOL_DETAIL_CACHE_VERSION = 1 as const;

type CachedSchoolDetailData = {
    version: number;
    cachedAt: number;
    school: School;
};

type CachedSchoolDetailSnapshot = {
    isFresh: boolean;
    school: School;
};

type SchoolDetailCacheArgs = {
    lang: SchoolLang;
    schoolId: string;
};

type PersistCachedSchoolDetailDataArgs = SchoolDetailCacheArgs & {
    school: School;
};

const getSchoolDetailCacheKey = (
    lang: SchoolLang,
    schoolId: string,
): string => {
    return `${SCHOOL_DETAIL_CACHE_KEY_PREFIX}:${lang}:${schoolId}`;
};

const isNonNegativeNumber = (value: unknown): value is number => {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

const isNullableString = (
    value: unknown,
): value is string | null | undefined => {
    return value == null || typeof value === "string";
};

const isNullableNumber = (
    value: unknown,
): value is number | null | undefined => {
    return value == null || typeof value === "number";
};

const isSchool = (value: unknown): value is School => {
    if (!value || typeof value !== "object") return false;

    const school = value as Partial<Record<keyof School, unknown>>;

    return (
        isNullableString(school.__typename) &&
        isNullableString(school.address) &&
        isNullableString(school.category) &&
        isNullableString(school.district) &&
        isNullableNumber(school.easting) &&
        isNullableString(school.fax) &&
        isNullableString(school.finance_type) &&
        isNullableString(school.lang) &&
        isNullableNumber(school.latitude) &&
        isNullableString(school.level) &&
        isNullableNumber(school.longitude) &&
        isNullableString(school.name) &&
        isNullableNumber(school.northing) &&
        isNullableString(school.school_id) &&
        isNullableString(school.session) &&
        isNullableString(school.students_gender) &&
        isNullableString(school.telephone)
    );
};

const isCachedSchoolDetailData = (
    value: unknown,
): value is CachedSchoolDetailData => {
    if (!value || typeof value !== "object") return false;

    const cacheData = value as {
        version?: unknown;
        cachedAt?: unknown;
        school?: unknown;
    };

    return (
        cacheData.version === SCHOOL_DETAIL_CACHE_VERSION &&
        isNonNegativeNumber(cacheData.cachedAt) &&
        isSchool(cacheData.school)
    );
};

const getCachedSchoolDetailData = async ({
    lang,
    schoolId,
}: SchoolDetailCacheArgs): Promise<CachedSchoolDetailSnapshot | null> => {
    try {
        const value: StorageValue = await storage.getItem(
            getSchoolDetailCacheKey(lang, schoolId),
        );

        if (!isCachedSchoolDetailData(value)) return null;

        return {
            isFresh: Date.now() - value.cachedAt <= SCHOOL_DETAIL_CACHE_TTL_MS,
            school: value.school,
        };
    } catch {
        return null;
    }
};

const persistCachedSchoolDetailData = async ({
    lang,
    school,
    schoolId,
}: PersistCachedSchoolDetailDataArgs): Promise<void> => {
    try {
        const payload: CachedSchoolDetailData = {
            version: SCHOOL_DETAIL_CACHE_VERSION,
            cachedAt: Date.now(),
            school,
        };

        await storage.setItem(getSchoolDetailCacheKey(lang, schoolId), payload);
    } catch {
        // Ignore storage failures
    }
};

export type { CachedSchoolDetailSnapshot };
export { getCachedSchoolDetailData, persistCachedSchoolDetailData };
