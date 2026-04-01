"use dom";

import "maplibre-gl/dist/maplibre-gl.css";

import type { LayerProps, MapLayerMouseEvent } from "@vis.gl/react-maplibre";
import type { DOMProps } from "expo/dom";

import type { Theme } from "#/contexts/theme";
import type {
    Maybe,
    Query,
    SchoolLang,
    SchoolsConnection,
    SchoolsConnectionEdge,
} from "#/graphql";
import type { Colors } from "#/hooks/colors";

import ReactMap, { Layer, Source } from "@vis.gl/react-maplibre";
import * as React from "react";

import { useLazyQuery } from "#/graphql";

type MapProps = {
    theme: Theme;
    colors: Colors;
    lang: SchoolLang;
    onClick: (id: string) => void;
    dom?: DOMProps;
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
const POINT_LAYER_ID = "point" as const;

type MapFeatureProperties = {
    schoolId: string;
};

type MapFeature = {
    type: "Feature";
    properties: MapFeatureProperties;
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
    schoolId: string,
    longitude: number,
    latitude: number,
): MapFeature => {
    return {
        type: "Feature",
        properties: {
            schoolId,
        },
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

    if (current.features.length === 0) return incoming;

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

        const schoolId: Maybe<string> | undefined = edge.node?.school_id;
        const longitude: Maybe<number> | undefined = edge.node?.longitude;
        const latitude: Maybe<number> | undefined = edge.node?.latitude;

        if (
            typeof schoolId !== "string" ||
            typeof longitude !== "number" ||
            typeof latitude !== "number"
        ) {
            continue;
        }

        features.push(createPointFeature(schoolId, longitude, latitude));
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

// Modules with the "use dom" directive only support a single default export.
export default ({
    theme,
    colors,
    lang,
    onClick,
}: MapProps): React.JSX.Element => {
    const requestVersionRef = React.useRef(0);

    const [sourceData, setSourceData] = React.useState<MapSourceData>(
        createEmptySourceData,
    );

    const [pagination, setPagination] = React.useState<PaginationState>(
        createEmptyPaginationState,
    );

    const [isPointHovered, setIsPointHovered] = React.useState(false);

    const [loadSchoolsPage, { error, isLoading }] = useLazyQuery(
        getSchoolsPageData,
        {
            fetchPolicy: "network-only",
            suspense: false,
        },
    );

    const layerProps: LayerProps = {
        id: POINT_LAYER_ID,
        type: "circle",
        paint: {
            "circle-radius": 5,
            "circle-color": colors.accent,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": colors.bg2,
        },
    };

    const applyPage = React.useEffectEvent(
        (
            pageData: SchoolsPageData,
            requestVersion: number,
            replace: boolean,
        ): void => {
            if (requestVersion !== requestVersionRef.current) return void 0;

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

    const handleMapClick = (event: MapLayerMouseEvent): void => {
        const schoolId = event.features?.[0]?.properties?.schoolId;

        if (typeof schoolId !== "string") return void 0;

        onClick(schoolId);
    };

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
                        lang,
                    },
                });

                applyPage(pageData, requestVersion, replace);
            } catch {
                return void 0;
            }
        },
    );

    React.useEffect((): (() => void) => {
        if (!lang) return (): void => void 0;

        requestVersionRef.current += 1;

        const requestVersion = requestVersionRef.current;

        React.startTransition((): void => {
            setSourceData(createEmptySourceData());
            setPagination(createEmptyPaginationState());
        });

        loadPage(void 0, true, requestVersion);

        return (): void => {
            requestVersionRef.current += 1;
        };
    }, [
        lang,
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
                attributionControl={false}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                interactiveLayerIds={[
                    POINT_LAYER_ID,
                ]}
                initialViewState={INITIAL_VIEW_STATE}
                mapStyle={
                    theme === "light" ? MAP_STYLES.light : MAP_STYLES.dark
                }
                cursor={isPointHovered ? "pointer" : "auto"}
                onClick={handleMapClick}
                onMouseEnter={(): void => setIsPointHovered(true)}
                onMouseLeave={(): void => setIsPointHovered(false)}
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
