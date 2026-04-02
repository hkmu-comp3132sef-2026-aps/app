import type * as React from "react";

import type { Colors } from "#/hooks/colors";

import { Tabs } from "expo-router";
import { Bolt, House } from "lucide-react-native";
import { useIntlayer } from "react-intlayer";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

import { useColors } from "#/hooks/colors";

export default (): React.JSX.Element => {
    const { width } = useWindowDimensions();

    const colors: Colors = useColors();

    const { home, settings } = useIntlayer("common");

    return (
        <Tabs
            screenOptions={{
                // Header
                headerStyle: {
                    backgroundColor: colors.bg1,
                    borderBottomColor: colors.bg3,
                },
                // Scene
                sceneStyle: {
                    backgroundColor: colors.bg1,
                },
                // TabBar
                tabBarVariant: width > 768 ? "material" : "uikit",
                tabBarPosition: width > 768 ? "left" : "bottom",
                tabBarLabelPosition: "below-icon",
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarInactiveBackgroundColor: colors.bg1,
                tabBarStyle: {
                    backgroundColor: colors.bg1,
                    borderColor: colors.bg3,
                },
                tabBarItemStyle: {
                    width: 64,
                    height: 64,
                },
            }}
        >
            <Tabs.Screen
                name="(home)/index"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }): React.JSX.Element => {
                        return (
                            <House
                                color={color}
                                width={size}
                                height={size}
                            />
                        );
                    },
                    tabBarLabel: ({ color }): React.JSX.Element => {
                        return (
                            <TabBarLabel
                                style={{
                                    color,
                                }}
                            >
                                {home.title}
                            </TabBarLabel>
                        );
                    },
                }}
            />
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: settings.title,
                    headerTintColor: colors.text,
                    tabBarIcon: ({ color, size }): React.JSX.Element => {
                        return (
                            <Bolt
                                color={color}
                                width={size}
                                height={size}
                            />
                        );
                    },
                    tabBarLabel: ({ color }): React.JSX.Element => {
                        return (
                            <TabBarLabel
                                style={{
                                    color,
                                }}
                            >
                                {settings.title}
                            </TabBarLabel>
                        );
                    },
                }}
            />
        </Tabs>
    );
};

const TabBarLabel = styled.Text({
    textAlign: "center",
    lineHeight: 14,
    fontSize: 12,
});
