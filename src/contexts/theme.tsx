import type { ColorSchemeName } from "react-native";

import * as React from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

type ThemeMode = Theme | "system";

type ThemeContextType = {
    theme: Theme;
    mode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

const ThemeContextProvider = ({
    children,
}: React.PropsWithChildren): React.JSX.Element => {
    const colorScheme: ColorSchemeName = useColorScheme();

    const [theme, setTheme] = React.useState<Theme>("light");
    const [mode, setMode] = React.useState<ThemeMode>("system");

    const setThemeMode = (themeMode: ThemeMode): void => {
        // light / dark
        if (themeMode !== "system") {
            setTheme(themeMode);
            setMode(themeMode);
            return void 0;
        }

        // system

        setMode(themeMode);

        // system dark
        if (colorScheme === "dark") {
            setTheme("dark");
            return void 0;
        }

        // system light
        setTheme("light");
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                mode,
                setThemeMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

const useThemeContext = (): ThemeContextType => {
    const context = React.useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useThemeContext must be used within a ThemeContextProvider",
        );
    }

    return context;
};

export type { Theme, ThemeContextType, ThemeMode };
export { ThemeContextProvider, useThemeContext };
