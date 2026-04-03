import type { LocalesValues } from "intlayer";
import type * as React from "react";
import type { ViewStyle } from "react-native";

import type { Colors } from "#/hooks/colors";

import { useIntlayer, useLocale } from "react-intlayer";
import styled from "styled-components/native";

import { useColors } from "#/hooks/colors";
import { getLocaleLabel } from "#/utils/locale";

const SettingsLang = (): React.JSX.Element => {
    const colors: Colors = useColors();

    const { setLocale, availableLocales } = useLocale();

    const { settings } = useIntlayer("common");

    return (
        <>
            <Title $colors={colors}>{settings.lang.title}</Title>
            <Container $colors={colors}>
                {availableLocales.map(
                    (locale: LocalesValues): React.JSX.Element => (
                        <Option
                            key={locale}
                            $colors={colors}
                            onPress={(): void => setLocale(locale)}
                            style={({ hovered, pressed }): ViewStyle[] => [
                                {
                                    backgroundColor: pressed
                                        ? colors.bg4
                                        : hovered
                                          ? colors.bg3
                                          : "transparent",
                                },
                            ]}
                        >
                            <OptionText $colors={colors}>
                                {getLocaleLabel(locale)}
                            </OptionText>
                        </Option>
                    ),
                )}
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
    paddingTop: 16,
    paddingLeft: 8,
    paddingBottom: 16,
    color: props.$colors.text,
}));

const Option = styled.Pressable<{
    $colors: Colors;
}>((props) => ({
    cursor: "pointer",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: props.$colors.bg3,
    transitionProperty: "background-color",
    transitionDuration: "0.2s",
}));

const OptionText = styled.Text<{
    $colors: Colors;
}>((props) => ({
    lineHeight: 20,
    fontSize: 16,
    padding: 16,
    color: props.$colors.textSecondary,
}));

export { SettingsLang };
