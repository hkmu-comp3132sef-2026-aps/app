import type * as React from "react";

import { ScrollView, View } from "react-native";

import { Blank } from "#/components/blank";
import { SettingsLang } from "#/modules/settings/components/lang";
import { SettingsTheme } from "#/modules/settings/components/theme";

export default (): React.JSX.Element => {
    return (
        <ScrollView
            style={{
                width: "100%",
                height: "100%",
                maxWidth: 480,
                margin: "auto",
            }}
        >
            <View
                style={{
                    marginLeft: 20,
                    marginRight: 20,
                }}
            >
                <Blank height={20} />
                <SettingsLang />
                <Blank height={20} />
                <SettingsTheme />
                <Blank height={20} />
            </View>
        </ScrollView>
    );
};
