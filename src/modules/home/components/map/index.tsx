"use dom";

import "maplibre-gl/dist/maplibre-gl.css";

import type { LayerProps, MapLayerMouseEvent } from "@vis.gl/react-maplibre";
import type { DOMProps } from "expo/dom";

import type { HomeMapProps } from "#/modules/home/components/map/@types";

import ReactMap, { Layer, Source } from "@vis.gl/react-maplibre";
import * as React from "react";
import styled from "styled-components";

import {
    INITIAL_VIEW_STATE,
    MAP_STYLES,
    POINT_LAYER_ID,
    SCHOOLS_SOURCE_ID,
} from "#/modules/home/components/map/constants";
import { useSchoolMapData } from "#/modules/home/components/map/hooks/data";

type HomeMapWebProps = HomeMapProps & {
    dom?: DOMProps;
};

// Modules with the "use dom" directive only support a single default export.
export default ({
    theme,
    colors,
    lang,
    onClick,
}: HomeMapWebProps): React.JSX.Element => {
    const [isPointHovered, setIsPointHovered] = React.useState(false);

    const { sourceData, statusText } = useSchoolMapData(lang);

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

    const handleMapClick = (event: MapLayerMouseEvent): void => {
        const schoolId: unknown = event.features?.[0]?.properties?.schoolId;

        if (typeof schoolId !== "string") return void 0;

        onClick(schoolId);
    };

    return (
        <Container>
            <ReactMap
                attributionControl={false}
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
                    id={SCHOOLS_SOURCE_ID}
                    type="geojson"
                    data={sourceData}
                >
                    <Layer {...layerProps} />
                </Source>
            </ReactMap>
            {statusText && <StatusBadge>{statusText}</StatusBadge>}
        </Container>
    );
};

const Container = styled.div({
    width: "100%",
    height: "100%",
    position: "relative",
});

const StatusBadge = styled.div({
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    color: "#f8fafc",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    pointerEvents: "none",
});
