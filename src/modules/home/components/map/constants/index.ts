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
const SCHOOLS_PAGE_SIZE = 1000 as const;

const NATIVE_PAGE_LOAD_DELAY_MS = 128 as const;
const NATIVE_SCHOOLS_PAGE_SIZE = 500 as const;

const SCHOOLS_SOURCE_ID = "schools" as const;
const POINT_LAYER_ID = "point" as const;

export {
    INITIAL_VIEW_STATE,
    MAP_STYLES,
    NATIVE_PAGE_LOAD_DELAY_MS,
    NATIVE_SCHOOLS_PAGE_SIZE,
    PAGE_LOAD_DELAY_MS,
    POINT_LAYER_ID,
    SCHOOLS_PAGE_SIZE,
    SCHOOLS_SOURCE_ID,
};
