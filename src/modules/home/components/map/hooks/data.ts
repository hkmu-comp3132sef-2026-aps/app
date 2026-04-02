import type {
    MapSourceData,
    PaginationState,
    SchoolLang,
    SchoolsPageData,
} from "#/modules/home/components/map/@types";

import * as React from "react";
import { Platform } from "react-native";

import {
    NATIVE_PAGE_LOAD_DELAY_MS,
    NATIVE_SCHOOLS_PAGE_SIZE,
    PAGE_LOAD_DELAY_MS,
    SCHOOLS_PAGE_SIZE,
} from "#/modules/home/components/map/constants";
import {
    getCachedSchoolMapData,
    persistCachedSchoolMapData,
} from "#/modules/home/components/map/data/cache";
import { createEmptyPaginationState } from "#/modules/home/components/map/data/pagination";
import { fetchSchoolsPageData } from "#/modules/home/components/map/data/schools-page";
import {
    appendSourceData,
    createEmptySourceData,
} from "#/modules/home/components/map/data/source";
import { getHomeMapStatusText } from "#/modules/home/components/map/data/status";

const useSchoolMapData = (lang: SchoolLang) => {
    const requestVersionRef = React.useRef(0);
    const sourceDataRef = React.useRef<MapSourceData>(createEmptySourceData());
    const paginationRef = React.useRef<PaginationState>(
        createEmptyPaginationState(),
    );
    const staleCacheRef = React.useRef<Awaited<
        ReturnType<typeof getCachedSchoolMapData>
    > | null>(null);

    const [error, setError] = React.useState<unknown>(null);

    const [sourceData, setSourceData] = React.useState<MapSourceData>(
        createEmptySourceData,
    );

    const [pagination, setPagination] = React.useState<PaginationState>(
        createEmptyPaginationState,
    );

    const pageLoadDelayMs: number =
        Platform.OS === "web" ? PAGE_LOAD_DELAY_MS : NATIVE_PAGE_LOAD_DELAY_MS;

    const schoolsPageSize: number =
        Platform.OS === "web" ? SCHOOLS_PAGE_SIZE : NATIVE_SCHOOLS_PAGE_SIZE;

    const [isLoading, setIsLoading] = React.useState(false);

    const setMapState = React.useEffectEvent(
        (
            nextSourceData: MapSourceData,
            nextPagination: PaginationState,
        ): void => {
            sourceDataRef.current = nextSourceData;
            paginationRef.current = nextPagination;

            React.startTransition((): void => {
                setSourceData(nextSourceData);
                setPagination(nextPagination);
            });
        },
    );

    const applyPage = React.useEffectEvent(
        (
            pageData: SchoolsPageData,
            requestVersion: number,
            replace: boolean,
        ): void => {
            if (requestVersion !== requestVersionRef.current) return void 0;

            const nextSourceData: MapSourceData = replace
                ? pageData.source
                : appendSourceData(sourceDataRef.current, pageData.source);

            const nextPagination: PaginationState = {
                endCursor: pageData.pageInfo.endCursor,
                hasNextPage: pageData.pageInfo.hasNextPage,
                loadedCount: replace
                    ? pageData.loadedCount
                    : paginationRef.current.loadedCount + pageData.loadedCount,
                totalCount: pageData.totalCount,
            };

            setMapState(nextSourceData, nextPagination);

            if (!nextPagination.hasNextPage) {
                void persistCachedSchoolMapData({
                    lang,
                    sourceData: nextSourceData,
                    totalCount: nextPagination.totalCount,
                });
            }
        },
    );

    const loadPage = React.useEffectEvent(
        async (
            after: string | undefined,
            replace: boolean,
            requestVersion: number,
        ): Promise<void> => {
            if (requestVersion !== requestVersionRef.current) return void 0;

            setIsLoading(true);

            try {
                const pageData = await fetchSchoolsPageData({
                    after,
                    first: schoolsPageSize,
                    lang,
                });

                applyPage(pageData, requestVersion, replace);
                setError(null);
            } catch (nextError: unknown) {
                if (requestVersion !== requestVersionRef.current) {
                    return void 0;
                }

                if (staleCacheRef.current) {
                    setMapState(
                        staleCacheRef.current.sourceData,
                        staleCacheRef.current.pagination,
                    );
                }

                setError(nextError);
            } finally {
                if (requestVersion === requestVersionRef.current) {
                    setIsLoading(false);
                }
            }
        },
    );

    React.useEffect((): (() => void) => {
        if (!lang) return (): void => void 0;

        requestVersionRef.current += 1;

        const requestVersion: number = requestVersionRef.current;

        setError(null);
        staleCacheRef.current = null;
        setMapState(createEmptySourceData(), createEmptyPaginationState());

        void (async (): Promise<void> => {
            const cachedData = await getCachedSchoolMapData(lang);

            if (requestVersion !== requestVersionRef.current) return void 0;

            if (cachedData?.isFresh) {
                setMapState(cachedData.sourceData, cachedData.pagination);
                return void 0;
            }

            staleCacheRef.current = cachedData;
            await loadPage(void 0, true, requestVersion);
        })();

        return (): void => {
            requestVersionRef.current += 1;
        };
    }, [
        lang,
    ]);

    React.useEffect((): VoidFunction => {
        if (error || !pagination.hasNextPage || isLoading) {
            return (): void => void 0;
        }

        const requestVersion: number = requestVersionRef.current;

        const timeoutId = setTimeout((): void => {
            void loadPage(pagination.endCursor, false, requestVersion);
        }, pageLoadDelayMs);

        return (): void => {
            clearTimeout(timeoutId);
        };
    }, [
        error,
        isLoading,
        pageLoadDelayMs,
        pagination.endCursor,
        pagination.hasNextPage,
    ]);

    return {
        error,
        isLoading,
        pagination,
        sourceData,
        statusText: getHomeMapStatusText(pagination, error, isLoading),
    };
};

export { useSchoolMapData };
