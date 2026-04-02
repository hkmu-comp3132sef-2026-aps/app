import type { ColorSchemeName } from "react-native";
import type { StorageValue } from "unstorage";

import * as React from "react";
import { useColorScheme } from "react-native";

import { storage } from "#/configs/unstorage";

type Theme = "light" | "dark";

type ThemeMode = Theme | "system";

type ThemeContextType = {
    theme: Theme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = "app:theme" as const;

const setStoredThemeMode = async (mode: ThemeMode): Promise<void> => {
    try {
        await storage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // Ignore storage failures
    }
};

const isThemeMode = (value: unknown): value is ThemeMode =>
    value === "light" || value === "dark" || value === "system";

const getStoredThemeMode = async (): Promise<ThemeMode> => {
    try {
        const value: StorageValue = await storage.getItem(THEME_STORAGE_KEY);

        return isThemeMode(value) ? value : "system";
    } catch {
        return "system";
    }
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

const ThemeContextProvider = ({
    children,
}: React.PropsWithChildren): React.JSX.Element => {
    const colorScheme: ColorSchemeName = useColorScheme();

    const [mode, setModeState] = React.useState<ThemeMode>("system");

    const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

    const hasUserSelectedModeRef = React.useRef<boolean>(false);

    const setMode = (nextMode: ThemeMode): void => {
        hasUserSelectedModeRef.current = true;
        setModeState(nextMode);
        setIsHydrated(true);
    };

    const theme: Theme =
        mode === "system" ? (colorScheme === "dark" ? "dark" : "light") : mode;

    React.useEffect((): void => {
        if (!isHydrated) return void 0;

        setStoredThemeMode(mode);
    }, [
        isHydrated,
        mode,
    ]);

    React.useEffect(() => {
        let isMounted: boolean = true;

        (async (): Promise<void> => {
            const storedMode: ThemeMode = await getStoredThemeMode();

            if (!isMounted) return void 0;

            if (!hasUserSelectedModeRef.current) {
                setModeState(storedMode);
            }

            setIsHydrated(true);
        })();

        return (): void => {
            isMounted = false;
        };
    }, []);

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
