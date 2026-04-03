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
        <>
            <Title $colors={colors}>{settings.theme.title}</Title>
            <Container $colors={colors}>
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
        </>
    );
};

const Container = styled.View<{
    $colors: Colors;
}>((props) => ({
    width: "100%",
    backgroundColor: props.$colors.bg2,
    borderRadius: 16,
    overflow: "hidden",
}));

const Title = styled.Text<{
    $colors: Colors;
}>((props) => ({
    lineHeight: 24,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    marginBottom: 20,
    color: props.$colors.text,
}));

export { SettingsTheme };
