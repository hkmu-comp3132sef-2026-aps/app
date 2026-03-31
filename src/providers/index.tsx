import type * as React from "react";

import { IntlayerProvider } from "react-native-intlayer";

import { ThemeContextProvider } from "#/contexts/theme";
import { getDeviceLocale } from "#/utils/locale";

type ProviderProps = {
    children: React.ReactNode;
};

const Providers = (props: ProviderProps): React.JSX.Element => {
    return (
        <ThemeContextProvider>
            <IntlayerProvider defaultLocale={getDeviceLocale()}>
                {props.children}
            </IntlayerProvider>
        </ThemeContextProvider>
    );
};

export type { ProviderProps };
export { Providers };
