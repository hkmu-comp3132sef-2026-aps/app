import type { Theme } from "#/contexts/theme";
import type {
    Maybe,
    Query,
    SchoolLang,
    SchoolsConnection,
    SchoolsConnectionEdge,
} from "#/graphql";
import type { Colors } from "#/hooks/colors";

type HomeMapProps = {
    theme: Theme;
    colors: Colors;
    lang: SchoolLang;
    onClick: (id: string) => void;
};

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

export type {
    HomeMapProps,
    MapFeature,
    MapFeatureProperties,
    MapSourceData,
    Maybe,
    PaginationState,
    Query,
    SchoolLang,
    SchoolsConnection,
    SchoolsConnectionEdge,
    SchoolsPageArgs,
    SchoolsPageData,
};
