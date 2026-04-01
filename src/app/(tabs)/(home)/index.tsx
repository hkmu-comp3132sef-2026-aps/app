/**
 * All state related parameters are managed by React Native.
 * Therefore, they have to be passed as props instead of
 * directly being used in the DOM component.
 */

import type { Router } from "expo-router";
import type * as React from "react";

import type { SchoolLang } from "#/graphql";
import type { Colors } from "#/hooks/colors";

import { useRouter } from "expo-router";

import { useThemeContext } from "#/contexts/theme";
import { useColors } from "#/hooks/colors";
import { useSchoolLang } from "#/hooks/school-lang";
import HomeMap from "#/modules/home/components/map";

export default (): React.JSX.Element => {
    const router: Router = useRouter();

    const { theme } = useThemeContext();

    const colors: Colors = useColors();

    const lang: SchoolLang = useSchoolLang();

    const onClick = (id: string): void => {
        router.push(`/schools/${id}`);
    };

    return (
        <HomeMap
            theme={theme}
            colors={colors}
            lang={lang}
            onClick={onClick}
        />
    );
};
