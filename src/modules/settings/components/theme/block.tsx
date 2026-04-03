import type * as React from "react";
import type { ViewStyle } from "react-native";

import type { Colors } from "#/hooks/colors";

import styled from "styled-components/native";

import { type ThemeMode, useThemeContext } from "#/contexts/theme";
import { useColors } from "#/hooks/colors";

type ThemeBlockProps = {
    title: string;
    value: ThemeMode;
};

const ThemeBlock = (props: ThemeBlockProps): React.JSX.Element => {
    const colors: Colors = useColors();

    const { setMode } = useThemeContext();

    return (
        <Option
            $colors={colors}
            onPress={(): void => setMode(props.value)}
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
            <OptionText $colors={colors}>{props.title}</OptionText>
        </Option>
    );
};

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

export { ThemeBlock };
