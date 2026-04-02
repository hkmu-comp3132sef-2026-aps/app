import type { OnPressEvent } from "@maplibre/maplibre-react-native";

import type { HomeMapProps } from "#/modules/home/components/map/@types";

import {
    Camera,
    CircleLayer,
    MapView,
    ShapeSource,
} from "@maplibre/maplibre-react-native";
import styled from "styled-components/native";

import {
    INITIAL_VIEW_STATE,
    MAP_STYLES,
    POINT_LAYER_ID,
    SCHOOLS_SOURCE_ID,
} from "#/modules/home/components/map/constants";
import { useSchoolMapData } from "#/modules/home/components/map/hooks/data";

export default ({
    theme,
    colors,
    lang,
    onClick,
}: HomeMapProps): React.JSX.Element => {
    const { sourceData, statusText } = useSchoolMapData(lang);

    const handlePress = (event: OnPressEvent): void => {
        const schoolId: unknown = event.features[0]?.properties?.schoolId;

        if (typeof schoolId !== "string") return void 0;

        onClick(schoolId);
    };

    return (
        <Container>
            <StyledMapView
                attributionEnabled={false}
                logoEnabled={false}
                compassEnabled={false}
                mapStyle={
                    theme === "light" ? MAP_STYLES.light : MAP_STYLES.dark
                }
            >
                <Camera
                    defaultSettings={{
                        centerCoordinate: [
                            INITIAL_VIEW_STATE.longitude,
                            INITIAL_VIEW_STATE.latitude,
                        ],
                        zoomLevel: INITIAL_VIEW_STATE.zoom,
                    }}
                />
                <ShapeSource
                    id={SCHOOLS_SOURCE_ID}
                    shape={sourceData}
                    hitbox={{
                        width: 20,
                        height: 20,
                    }}
                    onPress={handlePress}
                >
                    <CircleLayer
                        id={POINT_LAYER_ID}
                        style={{
                            circleRadius: 5,
                            circleColor: colors.accent,
                            circleStrokeWidth: 2.5,
                            circleStrokeColor: colors.bg2,
                        }}
                    />
                </ShapeSource>
            </StyledMapView>
            {statusText && (
                <StatusContainer pointerEvents="none">
                    <StatusText>{statusText}</StatusText>
                </StatusContainer>
            )}
        </Container>
    );
};

const Container = styled.View({
    flex: 1,
    position: "relative",
});

const StyledMapView = styled(MapView)({
    flex: 1,
});

const StatusContainer = styled.View({
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: 12,
    paddingVertical: 8,
});

const StatusText = styled.Text({
    color: "#f8fafc",
    fontSize: 12,
});
