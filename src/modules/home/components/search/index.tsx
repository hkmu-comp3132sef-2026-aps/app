import type { EdgeInsets } from "react-native-safe-area-context";

import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

import { SearchBox } from "#/modules/home/components/search/box";
import { SearchResult } from "#/modules/home/components/search/result";

const HomeSearch = (): React.JSX.Element => {
    const insets: EdgeInsets = useSafeAreaInsets();

    const [query, setQuery] = React.useState<string>("");
    const deferredQuery = React.useDeferredValue(query);

    return (
        <Container
            style={{
                paddingTop: insets.top,
            }}
        >
            <SearchBox
                query={query}
                setQuery={setQuery}
            />
            <SearchResult query={deferredQuery} />
        </Container>
    );
};

const Container = styled.View({
    position: "absolute",
    alignSelf: "center",
    top: 20,
    left: 20,
    width: "90%",
    height: "fit-content",
    maxWidth: 400,
});

export { HomeSearch };
