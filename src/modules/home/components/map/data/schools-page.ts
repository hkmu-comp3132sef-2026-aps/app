import type {
    MapFeature,
    Maybe,
    SchoolLang,
    SchoolsPageArgs,
    SchoolsPageData,
} from "#/modules/home/components/map/@types";

import { createPointFeature } from "#/modules/home/components/map/data/source";

const SCHOOLS_GRAPHQL_ENDPOINT = "https://sch-api.alpheus.day/graphql";

const SCHOOLS_PAGE_QUERY = `
    query SchoolsMapPage($after: String, $first: Int, $lang: SchoolLang!) {
        schoolsConnection(after: $after, first: $first, lang: $lang) {
            totalCount
            pageInfo {
                endCursor
                hasNextPage
            }
            edges {
                node {
                    school_id
                    longitude
                    latitude
                }
            }
        }
    }
`;

type SchoolsConnectionNodeLike = {
    school_id?: Maybe<string>;
    longitude?: Maybe<number>;
    latitude?: Maybe<number>;
};

type SchoolsConnectionEdgeLike = {
    node?: Maybe<SchoolsConnectionNodeLike>;
};

type SchoolsConnectionLike = {
    edges?: Maybe<Maybe<SchoolsConnectionEdgeLike>[]>;
    pageInfo?: Maybe<{
        endCursor?: Maybe<string>;
        hasNextPage?: Maybe<boolean>;
    }>;
    totalCount?: Maybe<number>;
};

type SchoolsPageGraphQLResponse = {
    data?: {
        schoolsConnection?: Maybe<SchoolsConnectionLike>;
    };
    errors?: {
        message?: Maybe<string>;
    }[];
};

const createSchoolsPageData = (
    connection: Maybe<SchoolsConnectionLike>,
): SchoolsPageData => {
    const edges: Maybe<SchoolsConnectionEdgeLike>[] = connection?.edges ?? [];

    const features: MapFeature[] = [];

    for (let i: number = 0; i < edges.length; i++) {
        const edge: Maybe<SchoolsConnectionEdgeLike> | undefined = edges[i];

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
            endCursor: connection?.pageInfo?.endCursor ?? undefined,
            hasNextPage: connection?.pageInfo?.hasNextPage ?? false,
        },
        loadedCount: edges.length,
        totalCount: connection?.totalCount ?? 0,
    };
};

const fetchSchoolsPageData = async (
    args: SchoolsPageArgs,
): Promise<SchoolsPageData> => {
    const response: Response = await fetch(SCHOOLS_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: SCHOOLS_PAGE_QUERY,
            variables: {
                after: args.after,
                first: args.first,
                lang: args.lang,
            } satisfies {
                after?: string;
                first: number;
                lang: SchoolLang;
            },
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to load schools page (${response.status.toString()})`,
        );
    }

    const payload: SchoolsPageGraphQLResponse = await response.json();

    const graphQLErrorMessage: string | undefined =
        payload.errors?.[0]?.message ?? undefined;

    if (graphQLErrorMessage) throw new Error(graphQLErrorMessage);

    return createSchoolsPageData(payload.data?.schoolsConnection ?? null);
};

export { fetchSchoolsPageData };
