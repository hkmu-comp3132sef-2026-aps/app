import type * as React from "react";

import { Text, View } from "react-native";

export default (): React.JSX.Element => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>{"Home"}</Text>
        </View>
    );
};
