import type { ViewStyle } from "react-native";

import type { Theme } from "#/contexts/theme";
import type { Maybe, School } from "#/graphql";
import type { Colors } from "#/hooks/colors";

import { useRouter } from "expo-router";
import * as React from "react";
import { useI18n } from "react-intlayer";
import {
    ActivityIndicator,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import styled from "styled-components/native";

import { useThemeContext } from "#/contexts/theme";
import { resolve, SchoolLang } from "#/graphql";
import { useColors } from "#/hooks/colors";
import { useSchoolLang } from "#/hooks/school-lang";

type SearchResultProps = {
    query: string;
};

type SearchResultItem = {
    address: Maybe<string>;
    category: Maybe<string>;
    district: Maybe<string>;
    level: Maybe<string>;
    name: Maybe<string>;
    school_id: string;
};

type FetchSearchResultsArgs = {
    lang: SchoolLang;
    search: string;
};

type FetchSchoolsByIdsArgs = {
    lang: SchoolLang;
    schoolIds: string[];
};

type UseSearchResultsResult = {
    hasLoaded: boolean;
    results: SearchResultItem[];
};

const SEARCH_RESULT_LIMIT = 8;

const isSearchResultItem = (
    result: SearchResultItem | null,
): result is SearchResultItem => {
    return typeof result?.school_id === "string" && result.school_id.length > 0;
};

const formatSearchText = (value: Maybe<string> | undefined): string | null => {
    if (typeof value !== "string") return null;

    const trimmedValue: string = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
};

const toUniqueSchoolIds = (results: SearchResultItem[]): string[] => {
    const schoolIds = new Set<string>();

    for (const result of results) {
        schoolIds.add(result.school_id);
    }

    return [
        ...schoolIds,
    ];
};

const fetchSearchResultsForLanguage = async ({
    lang,
    search,
}: FetchSearchResultsArgs): Promise<SearchResultItem[]> => {
    return await resolve(
        ({ query }) => {
            return (
                query
                    .schoolsConnection({
                        first: SEARCH_RESULT_LIMIT,
                        lang,
                        search,
                    })
                    ?.edges?.map((edge): SearchResultItem | null => {
                        const school: Maybe<School> | undefined = edge?.node;

                        if (!school) return null;

                        return {
                            address: school.address ?? null,
                            category: school.category ?? null,
                            district: school.district ?? null,
                            level: school.level ?? null,
                            name: school.name ?? null,
                            school_id: school.school_id ?? "",
                        };
                    })
                    .filter(isSearchResultItem) ?? []
            );
        },
        {
            cachePolicy: "no-cache",
            operationName: "SearchSchools",
        },
    );
};

const fetchSchoolsByIds = async ({
    lang,
    schoolIds,
}: FetchSchoolsByIdsArgs): Promise<SearchResultItem[]> => {
    if (schoolIds.length === 0) return [];

    return await resolve(
        ({ query }) => {
            return schoolIds
                .map((schoolId): SearchResultItem | null => {
                    const school: Maybe<School> = query.school({
                        lang,
                        schoolId,
                    });

                    if (!school) return null;

                    return {
                        address: school.address ?? null,
                        category: school.category ?? null,
                        district: school.district ?? null,
                        level: school.level ?? null,
                        name: school.name ?? null,
                        school_id: school.school_id ?? "",
                    };
                })
                .filter(isSearchResultItem);
        },
        {
            cachePolicy: "no-cache",
            operationName: "SearchSchoolsById",
        },
    );
};

const fetchSearchResults = async ({
    lang,
    search,
}: FetchSearchResultsArgs): Promise<SearchResultItem[]> => {
    const currentLanguageResults: SearchResultItem[] =
        await fetchSearchResultsForLanguage({
            lang,
            search,
        });

    if (currentLanguageResults.length > 0 || lang === SchoolLang.EN) {
        return currentLanguageResults;
    }

    const englishResults: SearchResultItem[] =
        await fetchSearchResultsForLanguage({
            lang: SchoolLang.EN,
            search,
        });

    if (englishResults.length === 0) {
        return [];
    }

    const localizedResults: SearchResultItem[] = await fetchSchoolsByIds({
        lang,
        schoolIds: toUniqueSchoolIds(englishResults),
    });

    if (localizedResults.length === 0) {
        return englishResults;
    }

    const localizedResultsMap = new Map<string, SearchResultItem>(
        localizedResults.map(
            (
                result,
            ): [
                string,
                SearchResultItem,
            ] => [
                result.school_id,
                result,
            ],
        ),
    );

    return englishResults.map(
        (result): SearchResultItem =>
            localizedResultsMap.get(result.school_id) ?? result,
    );
};

const getMetaText = (result: SearchResultItem): string | null => {
    const metaParts: string[] = [
        formatSearchText(result.district),
        formatSearchText(result.level),
        formatSearchText(result.category),
    ].flatMap((value): string[] =>
        value
            ? [
                  value,
              ]
            : [],
    );

    return metaParts.length > 0 ? metaParts.join(" • ") : null;
};

const useSearchResults = (
    lang: SchoolLang,
    search: string,
): UseSearchResultsResult => {
    const requestVersionRef = React.useRef<number>(0);

    const [results, setResults] = React.useState<SearchResultItem[]>([]);
    const [hasLoaded, setHasLoaded] = React.useState(false);

    const setSearchState = React.useEffectEvent(
        (nextResults: SearchResultItem[], nextHasLoaded: boolean): void => {
            React.startTransition((): void => {
                setResults(nextResults);
                setHasLoaded(nextHasLoaded);
            });
        },
    );

    const loadSearchResults = React.useEffectEvent(
        async (
            requestVersion: number,
            currentLang: SchoolLang,
            currentSearch: string,
        ): Promise<void> => {
            try {
                const nextResults: SearchResultItem[] =
                    await fetchSearchResults({
                        lang: currentLang,
                        search: currentSearch,
                    });

                if (requestVersion !== requestVersionRef.current) {
                    return void 0;
                }

                setSearchState(nextResults, true);
            } catch {
                if (requestVersion !== requestVersionRef.current) {
                    return void 0;
                }

                setSearchState([], true);
            }
        },
    );

    React.useEffect((): (() => void) => {
        requestVersionRef.current += 1;

        const requestVersion: number = requestVersionRef.current;

        if (!search) {
            setSearchState([], false);

            return (): void => {
                requestVersionRef.current += 1;
            };
        }

        setSearchState([], false);

        void loadSearchResults(requestVersion, lang, search);

        return (): void => {
            requestVersionRef.current += 1;
        };
    }, [
        lang,
        search,
    ]);

    return {
        hasLoaded,
        results,
    };
};

const SearchResult = ({
    query,
}: SearchResultProps): React.JSX.Element | null => {
    const { height } = useWindowDimensions();

    const router = useRouter();

    const { theme } = useThemeContext();
    const colors: Colors = useColors();
    const lang: SchoolLang = useSchoolLang();

    const t = useI18n("common");

    const normalizedQuery: string = query.trim();

    const { hasLoaded, results } = useSearchResults(lang, normalizedQuery);

    const isLoading: boolean = normalizedQuery.length > 0 && !hasLoaded;

    if (!normalizedQuery) return null;

    return (
        <Container
            $height={height}
            $theme={theme}
            $colors={colors}
        >
            {isLoading ? (
                <StateContainer>
                    <ActivityIndicator
                        color={colors.accent}
                        size="small"
                    />
                    <StateText $colors={colors}>
                        {t("home.search.loading")}
                    </StateText>
                </StateContainer>
            ) : results.length > 0 ? (
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {results.map(
                        (
                            result: SearchResultItem,
                            index: number,
                        ): React.JSX.Element => {
                            const metaText: string | null = getMetaText(result);
                            const addressText: string | null = formatSearchText(
                                result.address,
                            );

                            const schoolName: string =
                                formatSearchText(result.name) ??
                                t("schools.detail.unavailable");

                            return (
                                <ResultButton
                                    key={result.school_id}
                                    $colors={colors}
                                    $hasBorder={index > 0}
                                    onPress={(): void =>
                                        router.push(
                                            `/schools/${result.school_id}`,
                                        )
                                    }
                                    style={({
                                        hovered,
                                        pressed,
                                    }): ViewStyle[] => [
                                        {
                                            backgroundColor: pressed
                                                ? colors.bg3
                                                : hovered
                                                  ? colors.bg2
                                                  : "transparent",
                                        },
                                    ]}
                                >
                                    <ResultName
                                        $colors={colors}
                                        numberOfLines={2}
                                    >
                                        {schoolName}
                                    </ResultName>
                                    {metaText ? (
                                        <ResultMeta
                                            $colors={colors}
                                            numberOfLines={1}
                                        >
                                            {metaText}
                                        </ResultMeta>
                                    ) : null}
                                    {addressText ? (
                                        <ResultAddress
                                            $colors={colors}
                                            numberOfLines={2}
                                        >
                                            {addressText}
                                        </ResultAddress>
                                    ) : null}
                                </ResultButton>
                            );
                        },
                    )}
                </ScrollView>
            ) : (
                <StateContainer>
                    <StateText $colors={colors}>
                        {t("home.search.empty")}
                    </StateText>
                </StateContainer>
            )}
        </Container>
    );
};

const Container = styled.View<{
    $height: number;
    $theme: Theme;
    $colors: Colors;
}>(({ $height, $theme, $colors }) => ({
    marginTop: 20,
    width: "100%",
    height: "fit-content",
    maxHeight: $height * 0.6,
    backgroundColor: $colors.bg1,
    borderRadius: 32,
    overflow: "hidden",
    boxShadow:
        $theme === "dark"
            ? "0px 4px 16px rgba(0, 0, 0, 0.6)"
            : "0px 4px 12px rgba(0, 0, 0, 0.12)",
}));

const StateContainer = styled.View({
    minHeight: 256,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
});

const StateText = styled.Text<{
    $colors: Colors;
}>(({ $colors }) => ({
    color: $colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
}));

const ResultButton = styled.Pressable<{
    $colors: Colors;
    $hasBorder: boolean;
}>(({ $colors, $hasBorder }) => ({
    cursor: "pointer",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: $hasBorder ? 1 : 0,
    borderTopColor: $colors.bg3,
    transitionProperty: "background-color",
    transitionDuration: "0.2s",
}));

const ResultName = styled.Text<{
    $colors: Colors;
}>(({ $colors }) => ({
    color: $colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
}));

const ResultMeta = styled.Text<{
    $colors: Colors;
}>(({ $colors }) => ({
    color: $colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
}));

const ResultAddress = styled.Text<{
    $colors: Colors;
}>(({ $colors }) => ({
    color: $colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
}));

export { SearchResult };
