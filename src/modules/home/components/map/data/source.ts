import type {
    MapFeature,
    MapSourceData,
} from "#/modules/home/components/map/@types";

const createEmptySourceData = (): MapSourceData => {
    return {
        type: "FeatureCollection",
        features: [],
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

export { appendSourceData, createEmptySourceData, createPointFeature };
