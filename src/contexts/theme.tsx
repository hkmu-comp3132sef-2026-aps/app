import type { ColorSchemeName } from "react-native";

import * as React from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

type ThemeMode = Theme | "system";

type ThemeContextType = {
    theme: Theme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

const ThemeContextProvider = ({
    children,
}: React.PropsWithChildren): React.JSX.Element => {
    const colorScheme: ColorSchemeName = useColorScheme();

    const [mode, setMode] = React.useState<ThemeMode>("system");
    const theme: Theme =
        mode === "system" ? (colorScheme === "dark" ? "dark" : "light") : mode;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                mode,
                setMode,
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
