import type * as React from "react";

import type { Colors } from "#/hooks/colors";

import { useIntlayer } from "react-intlayer";
import styled from "styled-components/native";

import { useColors } from "#/hooks/colors";
import { ThemeBlock } from "./block";

const SettingsTheme = (): React.JSX.Element => {
    const colors: Colors = useColors();

    const { settings } = useIntlayer("common");

    return (
        <Container $colors={colors}>
            <Title $colors={colors}>{settings.theme.title}</Title>
            <ThemeBlock
                title={settings.theme.system}
                value={"system"}
            />
            <ThemeBlock
                title={settings.theme.light}
                value={"light"}
            />
            <ThemeBlock
                title={settings.theme.dark}
                value={"dark"}
            />
        </Container>
    );
};

const Container = styled.View<{
    $colors: Colors;
}>((props) => ({
    width: "100%",
    backgroundColor: props.$colors.bg2,
    borderRadius: "16px",
    overflow: "hidden",
}));

const Title = styled.Text<{
    $colors: Colors;
}>((props) => ({
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    color: props.$colors.text,
}));

export { SettingsTheme };
