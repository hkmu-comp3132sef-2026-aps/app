import type * as React from "react";

import { HomeMap } from "#/modules/home/components/map";

export default (): React.JSX.Element => {
    const onClick = (id: string): void => {
        console.log({
            id,
        });
    };

    return <HomeMap onClick={onClick} />;
};
