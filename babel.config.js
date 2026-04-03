/** @param {import('@babel/core').ConfigAPI} api */
module.exports = (api) => {
    api.cache(true);

    return {
        presets: [
            "babel-preset-expo",
        ],
        plugins: [
            "@babel/plugin-transform-template-literals",
        ],
        assumptions: {
            mutableTemplateObject: true,
        },
        overrides: [
            {
                test: [
                    /node_modules\/gqty\//,
                    /node_modules\/@gqty\/react\//,
                ],
                plugins: [
                    /**
                     * @gqty/react uses `super(...arguments)`, so Babel needs the
                     * class transform in the same override before the spread one.
                     */
                    "@babel/plugin-transform-classes",
                    /**
                     * Keep iterable spreads spec-correct for web production.
                     *
                     * GQty's query builder spreads Map/iterator values,
                     * and loose mode rewrites those into broken Array.concat calls.
                     */
                    [
                        "@babel/plugin-transform-spread",
                        {
                            loose: false,
                        },
                    ],
                ],
            },
        ],
    };
};
