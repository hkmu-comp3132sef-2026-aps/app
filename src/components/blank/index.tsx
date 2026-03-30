import type * as React from "react";

import styled from "styled-components/native";

type BlankProps = {
    height: string | number;
};

const Blank = (props: BlankProps): React.JSX.Element => {
    return <Container $height={props.height} />;
};

const Container = styled.View<{
    $height: string | number;
}>((props) => ({
    width: "100%",
    height: props.$height,
}));

export type { BlankProps };
export { Blank };
