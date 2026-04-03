import type * as React from "react";

import type { Colors } from "#/hooks/colors";

import { Stack } from "expo-router";

import { useColorSync } from "#/hooks/color-sync";
import { useColors } from "#/hooks/colors";
import { Providers } from "#/providers";

export const unstable_settings = {
    anchor: "(tabs)",
};

const StackLayout = (): React.JSX.Element => {
    useColorSync();

    const colors: Colors = useColors();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: colors.bg1,
                },
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
                name="schools/[id]"
                options={{
                    presentation: "formSheet",
                    sheetCornerRadius: 32,
                }}
            />
        </Stack>
    );
};

export default (): React.JSX.Element => {
    return (
        <Providers>
            <StackLayout />
        </Providers>
    );
};
