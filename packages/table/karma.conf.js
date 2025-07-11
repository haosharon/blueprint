/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */

module.exports = async function (config) {
    const { createKarmaConfig } = await import("@blueprintjs/karma-build-scripts");
    config.set(
        createKarmaConfig({
            dirname: __dirname,
            coverageExcludes: [
                // don't check barrel files or deprecated APIs
                "src/**/index.ts",
            ],
            coverageOverrides: {
                "src/cell/cell*": {
                    lines: 70,
                },
                "src/common/clipboard*": {
                    lines: 0,
                    statements: 0,
                },
                "src/headers/headerCell*": {
                    lines: 70,
                    statements: 70,
                },
                "src/interactions/menus/copyCellsMenuItem*": {
                    lines: 30,
                    statements: 30,
                },
                "src/tableHotkeys*": {
                    lines: 65,
                    statements: 65,
                },
            },
        }),
    );
};
