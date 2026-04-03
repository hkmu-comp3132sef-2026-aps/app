import type { ViewStyle } from "react-native";

import type { Theme } from "#/contexts/theme";
import type { Colors } from "#/hooks/colors";

import { X } from "lucide-react-native";
import * as React from "react";
import { useI18n } from "react-intlayer";
import { Platform } from "react-native";
import styled from "styled-components/native";

import { useThemeContext } from "#/contexts/theme";
import { useColors } from "#/hooks/colors";

type SearchBoxProps = {
    query: string;
    setQuery: (query: string) => void;
};

const SEARCH_INPUT_ID = "home-search-input";

const SearchBox = ({ query, setQuery }: SearchBoxProps): React.JSX.Element => {
    const { theme } = useThemeContext();
    const colors: Colors = useColors();

    const t = useI18n("common");

    const focusSearchInput = React.useEffectEvent((): void => {
        const inputElement = document.getElementById(SEARCH_INPUT_ID);

        if (!(inputElement instanceof HTMLElement)) return;

        inputElement.focus();
    });

    React.useEffect(() => {
        if (Platform.OS !== "web") return undefined;

        const handleKeyDown = (event: KeyboardEvent): void => {
            const isShortcutPressed: boolean =
                (event.metaKey || event.ctrlKey) &&
                !event.altKey &&
                !event.shiftKey &&
                event.key.toLowerCase() === "k";

            if (!isShortcutPressed) return;

            event.preventDefault();
            focusSearchInput();
        };

        document.addEventListener("keydown", handleKeyDown);

        return (): void => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <Container
            $theme={theme}
            $colors={colors}
        >
            <InnerContainer>
                <SearchInput
                    $colors={colors}
                    nativeID={SEARCH_INPUT_ID}
                    placeholder={t("home.search.title")}
                    placeholderTextColor={colors.textSecondary}
                    onChangeText={setQuery}
                    value={query}
                />
                <ActionArea>
                    {query ? (
                        <ClearButton
                            onPress={(): void => setQuery("")}
                            style={({ hovered, pressed }): ViewStyle[] => [
                                {
                                    backgroundColor: pressed
                                        ? colors.bg3
                                        : hovered
                                          ? colors.bg2
                                          : "transparent",
                                },
                            ]}
                        >
                            <ClearIcon $colors={colors} />
                        </ClearButton>
                    ) : null}
                </ActionArea>
            </InnerContainer>
        </Container>
    );
};

const Container = styled.View<{
    $theme: Theme;
    $colors: Colors;
}>(({ $theme, $colors }) => ({
    width: "100%",
    height: 48,
    backgroundColor: $colors.bg1,
    borderRadius: 32,
    overflow: "hidden",
    boxShadow:
        $theme === "dark"
            ? "0px 4px 16px rgba(0, 0, 0, 0.6)"
            : "0px 4px 12px rgba(0, 0, 0, 0.12)",
}));

const InnerContainer = styled.View({
    display: "flex",
    flexDirection: "row",
});

const SearchInput = styled.TextInput<{
    $colors: Colors;
}>(({ $colors }) => ({
    flex: 1,
    height: 48,
    fontSize: 16,
    lineHeight: 20,
    padding: (48 - 20) / 2,
    color: $colors.text,
    outlineStyle: "none",
}));

const ActionArea = styled.View({
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
});

const ClearButton = styled.Pressable({
    cursor: "pointer",
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
});

const ClearIcon = styled(X)<{
    $colors: Colors;
}>(({ $colors }) => ({
    width: 24,
    height: 24,
    color: $colors.textSecondary,
}));

export type { SearchBoxProps };
export { SearchBox };
