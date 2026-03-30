import type * as React from "react";

import { getLocales } from "expo-localization";
import { IntlayerProvider } from "react-native-intlayer";

import { ThemeContextProvider } from "#/contexts/theme";

type ProviderProps = {
    children: React.ReactNode;
};

const getDeviceLocale = (): string => getLocales()[0]?.languageTag;

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
