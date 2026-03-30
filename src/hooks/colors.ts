import { useThemeContext } from "#/contexts/theme";

const colorsLight = {
    bg1: "#fff",
    bg2: "#f6f6f6",
    bg3: "#eee",
    bg4: "#e0e0e0",
    bg5: "#d9d9d9",
    text: "#111",
    textSecondary: "#666",
    accent: "#3498db",
};

type Colors = typeof colorsLight;

const colorsDark = {
    bg1: "#000",
    bg2: "#111",
    bg3: "#222",
    bg4: "#333",
    bg5: "#444",
    text: "#fff",
    textSecondary: "#aaa",
    accent: "#2980b9",
} satisfies Colors;

const useColors = (): Colors => {
    const { theme } = useThemeContext();
    return theme === "light" ? colorsLight : colorsDark;
};

export type { Colors };
export { useColors };
