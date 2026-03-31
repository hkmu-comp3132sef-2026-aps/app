import type { Router } from "expo-router";
import type * as React from "react";

import { useRouter } from "expo-router";

import { HomeMap } from "#/modules/home/components/map";

export default (): React.JSX.Element => {
    const router: Router = useRouter();

    const onClick = (id: string): void => {
        router.push(`/schools/${id}`);
    };

    return <HomeMap onClick={onClick} />;
};
