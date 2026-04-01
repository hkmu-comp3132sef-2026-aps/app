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
        <Container $colors={colors}>
            <Title $colors={colors}>{settings.lang.title}</Title>
            {availableLocales.map(
                (locale: LocalesValues): React.JSX.Element => (
                    <Option
                        key={locale}
                        $colors={colors}
                        onPress={(): void => setLocale(locale)}
                        style={({ pressed }): ViewStyle[] => [
                            {
                                backgroundColor: pressed
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
    fontSize: 16,
    padding: 16,
    color: props.$colors.textSecondary,
}));

export { SettingsLang };
