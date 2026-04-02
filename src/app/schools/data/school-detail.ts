/**
 * Fetch all data here to avoid unexpected cache issues
 *
 * For example, didn't fetch a specific data but being used later after caching.
 */

import type { Maybe, School, SchoolLang } from "#/graphql";

import { resolve } from "#/graphql";

type SchoolDetailArgs = {
    lang: SchoolLang;
    schoolId: string;
};

const selectSchoolDetail = (school: Maybe<School>): Maybe<School> => {
    if (!school) return null;

    return {
        __typename: school.__typename,
        address: school.address,
        category: school.category,
        district: school.district,
        easting: school.easting,
        fax: school.fax,
        finance_type: school.finance_type,
        lang: school.lang,
        latitude: school.latitude,
        level: school.level,
        longitude: school.longitude,
        name: school.name,
        northing: school.northing,
        school_id: school.school_id,
        session: school.session,
        students_gender: school.students_gender,
        telephone: school.telephone,
    };
};

const fetchSchoolDetailData = async ({
    lang,
    schoolId,
}: SchoolDetailArgs): Promise<Maybe<School>> => {
    return await resolve(
        ({ query }) => {
            return selectSchoolDetail(
                query.school({
                    lang,
                    schoolId,
                }),
            );
        },
        {
            cachePolicy: "no-cache",
            operationName: "SchoolDetail",
        },
    );
};

export { fetchSchoolDetailData };
