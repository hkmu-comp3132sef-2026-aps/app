import type { Maybe, School, SchoolLang } from "#/graphql";

import * as React from "react";

import {
    getCachedSchoolDetailData,
    persistCachedSchoolDetailData,
} from "#/app/schools/data/cache";
import { fetchSchoolDetailData } from "#/app/schools/data/school-detail";

type UseSchoolDetailDataResult = {
    hasLoaded: boolean;
    school: Maybe<School>;
};

const useSchoolDetailData = (
    lang: SchoolLang,
    schoolId: string | undefined,
): UseSchoolDetailDataResult => {
    const requestVersionRef = React.useRef(0);
    const staleCacheRef = React.useRef<Awaited<
        ReturnType<typeof getCachedSchoolDetailData>
    > | null>(null);

    const [school, setSchool] = React.useState<Maybe<School>>(null);
    const [hasLoaded, setHasLoaded] = React.useState(false);

    const setSchoolState = React.useEffectEvent(
        (nextSchool: Maybe<School>, nextHasLoaded: boolean): void => {
            React.startTransition((): void => {
                setSchool(nextSchool);
                setHasLoaded(nextHasLoaded);
            });
        },
    );

    const loadSchool = React.useEffectEvent(
        async (requestVersion: number): Promise<void> => {
            if (!schoolId || requestVersion !== requestVersionRef.current) {
                return void 0;
            }

            try {
                const nextSchool = await fetchSchoolDetailData({
                    lang,
                    schoolId,
                });

                if (requestVersion !== requestVersionRef.current) {
                    return void 0;
                }

                setSchoolState(nextSchool, true);

                if (nextSchool) {
                    void persistCachedSchoolDetailData({
                        lang,
                        school: nextSchool,
                        schoolId,
                    });
                }
            } catch {
                if (requestVersion !== requestVersionRef.current) {
                    return void 0;
                }

                setSchoolState(staleCacheRef.current?.school ?? null, true);
            }
        },
    );

    React.useEffect((): (() => void) => {
        requestVersionRef.current += 1;

        const requestVersion: number = requestVersionRef.current;

        staleCacheRef.current = null;

        if (!schoolId) {
            setSchoolState(null, true);

            return (): void => {
                requestVersionRef.current += 1;
            };
        }

        setSchoolState(null, false);

        void (async (): Promise<void> => {
            const cachedData = await getCachedSchoolDetailData({
                lang,
                schoolId,
            });

            if (requestVersion !== requestVersionRef.current) return void 0;

            if (cachedData?.isFresh) {
                setSchoolState(cachedData.school, true);
                return void 0;
            }

            staleCacheRef.current = cachedData;
            await loadSchool(requestVersion);
        })();

        return (): void => {
            requestVersionRef.current += 1;
        };
    }, [
        lang,
        schoolId,
    ]);

    return {
        hasLoaded,
        school,
    };
};

export { useSchoolDetailData };
