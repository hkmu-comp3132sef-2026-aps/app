"use dom";

import "maplibre-gl/dist/maplibre-gl.css";

import type { DOMProps } from "expo/dom";
import type { LayerProps } from "react-map-gl/maplibre";

import type {
    Maybe,
    Query,
    SchoolLang,
    SchoolsConnection,
    SchoolsConnectionEdge,
} from "#/graphql";

import * as React from "react";
import ReactMap, { Layer, Source } from "react-map-gl/maplibre";

import { useThemeContext } from "#/contexts/theme";
import { getSchoolLang } from "#/functions/school-lang";
import { useLazyQuery } from "#/graphql";

type MapProps = {
    dom?: DOMProps;
};

const layerProps: LayerProps = {
    id: "point",
    type: "circle",
    paint: {
        "circle-radius": 10,
        "circle-color": "#007cbf",
    },
};

const INITIAL_VIEW_STATE = {
    longitude: 114.15,
    latitude: 22.35,
    zoom: 10,
} as const;

const MAP_STYLES = {
    light: "https://tiles.openfreemap.org/styles/bright",
    dark: "https://tiles.openfreemap.org/styles/fiord",
} as const;

const PAGE_LOAD_DELAY_MS = 64 as const;
const SCHOOLS_PAGE_SIZE = 500 as const;

type MapFeature = {
    type: "Feature";
    properties: object;
    geometry: {
        type: "Point";
        coordinates: [
            number,
            number,
        ];
    };
};

type MapSourceData = {
    type: "FeatureCollection";
    features: MapFeature[];
};

type PaginationState = {
    endCursor: string | undefined;
    hasNextPage: boolean;
    loadedCount: number;
    totalCount: number;
};

type SchoolsPageArgs = {
    after?: string;
    first: number;
    lang: SchoolLang;
};

type SchoolsPageData = {
    source: MapSourceData;
    pageInfo: {
        endCursor: string | undefined;
        hasNextPage: boolean;
    };
    loadedCount: number;
    totalCount: number;
};

const createEmptySourceData = (): MapSourceData => {
    return {
        type: "FeatureCollection",
        features: [],
    };
};

const createEmptyPaginationState = (): PaginationState => {
    return {
        endCursor: undefined,
        hasNextPage: false,
        loadedCount: 0,
        totalCount: 0,
    };
};

const createPointFeature = (
    longitude: number,
    latitude: number,
): MapFeature => {
    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Point",
            coordinates: [
                longitude,
                latitude,
            ],
        },
    };
};

const appendSourceData = (
    current: MapSourceData,
    incoming: MapSourceData,
): MapSourceData => {
    if (incoming.features.length === 0) return current;

    if (current.features.length === 0) {
        return incoming;
    }

    return {
        type: "FeatureCollection",
        features: current.features.concat(incoming.features),
    };
};

const getSchoolsPageData = (
    query: Query,
    args: SchoolsPageArgs,
): SchoolsPageData => {
    const connection: Maybe<SchoolsConnection> = query.schoolsConnection(args);

    const edges: Maybe<SchoolsConnectionEdge>[] = connection?.edges ?? [];

    const features: MapFeature[] = [];

    for (let i: number = 0; i < edges.length; i++) {
        const edge: Maybe<SchoolsConnectionEdge> | undefined = edges[i];

        if (!edge) continue;

        const longitude: Maybe<number> | undefined = edge.node?.longitude;
        const latitude: Maybe<number> | undefined = edge.node?.latitude;

        if (typeof longitude !== "number" || typeof latitude !== "number") {
            continue;
        }

        features.push(createPointFeature(longitude, latitude));
    }

    return {
        source: {
            type: "FeatureCollection",
            features,
        },
        pageInfo: {
            endCursor: connection?.pageInfo.endCursor ?? undefined,
            hasNextPage: connection?.pageInfo.hasNextPage ?? false,
        },
        loadedCount: edges.length,
        totalCount: connection?.totalCount ?? 0,
    };
};

const HomeMap = (): React.JSX.Element => {
    const { theme } = useThemeContext();

    const schoolLang = getSchoolLang();

    const requestVersionRef = React.useRef(0);

    const [sourceData, setSourceData] = React.useState<MapSourceData>(
        createEmptySourceData,
    );

    const [pagination, setPagination] = React.useState<PaginationState>(
        createEmptyPaginationState,
    );

    const [loadSchoolsPage, { error, isLoading }] = useLazyQuery(
        getSchoolsPageData,
        {
            fetchPolicy: "network-only",
            suspense: false,
        },
    );

    const applyPage = React.useEffectEvent(
        (
            pageData: SchoolsPageData,
            requestVersion: number,
            replace: boolean,
        ): void => {
            if (requestVersion !== requestVersionRef.current) return;

            React.startTransition(() => {
                setSourceData((current): MapSourceData => {
                    if (replace) return pageData.source;

                    return appendSourceData(current, pageData.source);
                });

                setPagination((current): PaginationState => {
                    return {
                        endCursor: pageData.pageInfo.endCursor,
                        hasNextPage: pageData.pageInfo.hasNextPage,
                        loadedCount: replace
                            ? pageData.loadedCount
                            : current.loadedCount + pageData.loadedCount,
                        totalCount: pageData.totalCount,
                    };
                });
            });
        },
    );

    const loadPage = React.useEffectEvent(
        async (
            after: string | undefined,
            replace: boolean,
            requestVersion: number,
        ): Promise<void> => {
            try {
                const pageData = await loadSchoolsPage({
                    args: {
                        after,
                        first: SCHOOLS_PAGE_SIZE,
                        lang: schoolLang,
                    },
                });

                applyPage(pageData, requestVersion, replace);
            } catch {
                return;
            }
        },
    );

    React.useEffect((): (() => void) => {
        if (!schoolLang) return (): void => void 0;

        requestVersionRef.current += 1;

        const requestVersion = requestVersionRef.current;

        React.startTransition(() => {
            setSourceData(createEmptySourceData());
            setPagination(createEmptyPaginationState());
        });

        loadPage(undefined, true, requestVersion);

        return (): void => {
            requestVersionRef.current += 1;
        };
    }, [
        schoolLang,
    ]);

    React.useEffect((): VoidFunction => {
        if (error || !pagination.hasNextPage || isLoading)
            return (): void => void 0;

        const timeoutId = window.setTimeout((): void => {
            loadPage(pagination.endCursor, false, requestVersionRef.current);
        }, PAGE_LOAD_DELAY_MS);

        return (): void => {
            window.clearTimeout(timeoutId);
        };
    }, [
        error,
        isLoading,
        pagination.endCursor,
        pagination.hasNextPage,
    ]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
            }}
        >
            <ReactMap
                style={{
                    width: "100%",
                    height: "100%",
                }}
                initialViewState={INITIAL_VIEW_STATE}
                mapStyle={
                    theme === "light" ? MAP_STYLES.light : MAP_STYLES.dark
                }
            >
                <Source
                    id="schools"
                    type="geojson"
                    data={sourceData}
                >
                    <Layer {...layerProps} />
                </Source>
            </ReactMap>
            {(error || isLoading || pagination.hasNextPage) && (
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: "rgba(15, 23, 42, 0.78)",
                        color: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        pointerEvents: "none",
                    }}
                >
                    {error
                        ? "Unable to finish loading schools"
                        : pagination.totalCount > 0
                          ? `${pagination.loadedCount.toLocaleString()} / ${pagination.totalCount.toLocaleString()} schools`
                          : "Loading schools"}
                </div>
            )}
        </div>
    );
};

export type { MapProps };
export { HomeMap };
