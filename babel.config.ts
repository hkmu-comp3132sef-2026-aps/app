import type { TransformOptions } from "babel-core";

type ConfigFunctionAPI = {
    version: string;
    cache: {
        (bool: boolean): void;
        forever: () => void;
        never: () => void;
        using: (env: () => typeof process.env.NODE_ENV) => void;
        invalidate: (env: () => typeof process.env.NODE_ENV) => void;
    };
};

type BabelPresetEnvTargetsBrowsers =
    | "android"
    | "chrome"
    | "deno"
    | "edge"
    | "electron"
    | "firefox"
    | "ie"
    | "ios"
    | "node"
    | "opera"
    | "rhino"
    | "safari"
    | "samsung";

type BabelPresetEnvTargets =
    | string
    | {
          [key in BabelPresetEnvTargetsBrowsers]: string;
      };

const config = (api: ConfigFunctionAPI): TransformOptions => {
    // cache
    api.cache(true);

    const isDev: boolean = process.env.NODE_ENV === "development";

    const isNative: boolean =
        process.env.PLATFORM === "android" || process.env.PLATFORM === "ios";

    const isWeb: boolean = process.env.PLATFORM === "web";

    // Android 7.0+ and iOS 15.1+
    const nativeTargets: Partial<BabelPresetEnvTargets> = {
        android: "52", // android webview version
        ios: "15.1",
    };

    /**
     * Require dynamic import in web:
     * https://caniuse.com/es6-module-dynamic-import
     */
    const webTargets: Partial<BabelPresetEnvTargets> = {
        chrome: "63",
        edge: "79",
        safari: "11.1",
        firefox: "67",
        opera: "50",
        samsung: "8.2",
    };

    const devTargets: Partial<BabelPresetEnvTargets> = {
        ...nativeTargets,
        ...webTargets,
    };

    // return
    return {
        presets: [
            "babel-preset-expo",
            [
                "@babel/preset-env",
                {
                    targets: {
                        ...(isNative && nativeTargets),
                        ...(isWeb && webTargets),
                        ...(isDev && devTargets),
                    },
                    loose: true,
                    exclude: [
                        "proposal-dynamic-import",
                    ],
                    useBuiltIns: "entry",
                    corejs: "3.49.0",
                },
            ],
        ],
    };
};

export default config;
