"use dom";

import "maplibre-gl/dist/maplibre-gl.css";

import type { DOMProps } from "expo/dom";
import type { LayerProps, MapLayerMouseEvent } from "react-map-gl/maplibre";

import type {
    Maybe,
    Query,
    SchoolLang,
    SchoolsConnection,
    SchoolsConnectionEdge,
} from "#/graphql";
import type { Colors } from "#/hooks/colors";

import * as React from "react";
import ReactMap, { Layer, Source } from "react-map-gl/maplibre";

import { useThemeContext } from "#/contexts/theme";
import { useLazyQuery } from "#/graphql";
import { useColors } from "#/hooks/colors";
import { useSchoolLang } from "#/hooks/school-lang";

type MaplibreModule = typeof import("maplibre-gl");

declare global {
    interface Window {
        maplibregl?: MaplibreModule;
        __maplibreLoadPromise__?: Promise<MaplibreModule>;
    }
}

const MAPLIBRE_SCRIPT_URL =
    `${process.env.EXPO_BASE_URL ?? "/"}vendor/maplibre-gl-csp.js` as const;
const MAPLIBRE_WORKER_URL =
    `${process.env.EXPO_BASE_URL ?? "/"}vendor/maplibre-gl-csp-worker.js` as const;

// Expo DOM runs inside a WebView-backed browser context, but Metro does not
// execute MapLibre's published UMD bundles reliably as imported modules there.
const finalizeMaplibre = (resolve: (module: MaplibreModule) => void): void => {
    const maplibre = window.maplibregl;

    if (!maplibre) {
        throw new Error("MapLibre did not attach to window");
    }

    maplibre.setWorkerUrl(MAPLIBRE_WORKER_URL);

    resolve(maplibre);
};

const loadMaplibre = (): Promise<MaplibreModule> => {
    if (window.maplibregl) {
        window.maplibregl.setWorkerUrl(MAPLIBRE_WORKER_URL);

        return Promise.resolve(window.maplibregl);
    }

    if (window.__maplibreLoadPromise__) {
        return window.__maplibreLoadPromise__;
    }

    window.__maplibreLoadPromise__ = new Promise<MaplibreModule>(
        (resolve, reject): void => {
            const handleLoad = (): void => {
                try {
                    finalizeMaplibre(resolve);
                } catch (error) {
                    window.__maplibreLoadPromise__ = undefined;

                    reject(error);
                }
            };

            const handleError = (): void => {
                window.__maplibreLoadPromise__ = undefined;
                reject(new Error("Unable to load the MapLibre script"));
            };

            const existingScript: Element | null = document.querySelector(
                'script[data-maplibre-script="true"]',
            );

            if (existingScript instanceof HTMLScriptElement) {
                existingScript.addEventListener("load", handleLoad, {
                    once: true,
                });

                existingScript.addEventListener("error", handleError, {
                    once: true,
                });

                return void 0;
            }

            const script: HTMLScriptElement = document.createElement("script");

            script.src = MAPLIBRE_SCRIPT_URL;

            script.async = true;

            script.dataset.maplibreScript = "true";

            script.addEventListener("load", handleLoad, {
                once: true,
            });

            script.addEventListener("error", handleError, {
                once: true,
            });

            document.head.appendChild(script);
        },
    );

    return window.__maplibreLoadPromise__;
};

type MapProps = {
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

const HomeMap = (props: MapProps): React.JSX.Element => {
    const { theme } = useThemeContext();

    const colors: Colors = useColors();

    const lang: SchoolLang = useSchoolLang();

    const [maplibre, setMaplibre] = React.useState<MaplibreModule | null>(
        (): MaplibreModule | null => {
            if (typeof window === "undefined" || !window.maplibregl)
                return null;

            window.maplibregl.setWorkerUrl(MAPLIBRE_WORKER_URL);

            return window.maplibregl;
        },
    );

    const [maplibreError, setMaplibreError] = React.useState<Error | null>(
        null,
    );

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

    const handleMapClick = (event: MapLayerMouseEvent): void => {
        const schoolId = event.features?.[0]?.properties?.schoolId;

        if (typeof schoolId !== "string") return void 0;

        props.onClick(schoolId);
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
                return;
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
        if (maplibre) return (): void => void 0;

        let isCancelled: boolean = false;

        loadMaplibre()
            .then((module): void => {
                if (isCancelled) return void 0;

                setMaplibre(module);
            })
            .catch((error): void => {
                if (isCancelled) return void 0;

                setMaplibreError(
                    error instanceof Error
                        ? error
                        : new Error("Unable to load MapLibre"),
                );
            });

        return (): void => {
            isCancelled = true;
        };
    }, [
        maplibre,
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
            {maplibre ? (
                <ReactMap
                    attributionControl={false}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    mapLib={maplibre}
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
            ) : (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(15, 23, 42, 0.78)",
                        color: "#f8fafc",
                        padding: "8px 12px",
                        fontSize: 14,
                    }}
                >
                    {maplibreError
                        ? "Unable to load map engine"
                        : "Loading map engine"}
                </div>
            )}
            {maplibre && (error || isLoading || pagination.hasNextPage) && (
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
