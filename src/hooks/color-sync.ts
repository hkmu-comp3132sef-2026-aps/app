import type { Colors } from "#/hooks/colors";

import { setStyle } from "expo-navigation-bar";
import { setStatusBarStyle } from "expo-status-bar";
import { setBackgroundColorAsync } from "expo-system-ui";
import * as React from "react";

import { useThemeContext } from "#/contexts/theme";
import { useColors } from "#/hooks/colors";

const useColorSync = (): void => {
    const { theme } = useThemeContext();

    const colors: Colors = useColors();

    React.useEffect((): void => {
        // bg
        setBackgroundColorAsync(colors.bg1);
    }, [
        colors,
    ]);

    React.useEffect((): void => {
        // status bar
        setStatusBarStyle(theme === "dark" ? "light" : "dark");

        // navigation bar
        setStyle(theme === "dark" ? "dark" : "light");
    }, [
        theme,
    ]);
};

export { useColorSync };
