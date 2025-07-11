/* !
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
 */

module.exports = {
    "header/header": [
        "error",
        "block",
        {
            pattern:
                "(!\n)?((@license)|(\\(c\\) ))?Copyright \\d{4} Palantir Technologies,? Inc\\. All rights reserved\\.",
            template: "!\n* (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.\n",
        },
        2,
    ],
    "import/no-default-export": "error",
    "import/no-extraneous-dependencies": [
        "error",
        {
            devDependencies: ["**/test/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "webpack.config.js", "karma.conf.js"],
        },
    ],
    "import/order": [
        "error",
        {
            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
            groups: [["builtin", "external"], "internal", "parent", "sibling", "index", ["unknown", "object"]],
            "newlines-between": "always",
        },
    ],
    "jsdoc/check-alignment": "error",
    "jsdoc/check-indentation": "off",
    "jsdoc/tag-lines": [
        "error",
        "always",
        {
            applyToEndTag: false,
            count: 0,
            startLines: 1,
            endLines: 0,
        },
    ],
    "react/display-name": "error",
    "react/jsx-boolean-value": ["error", "always"],
    "react/jsx-key": [
        "error",
        {
            checkFragmentShorthand: true,
        },
    ],
    "react/jsx-no-bind": [
        "error",
        {
            ignoreDOMComponents: true,
            ignoreRefs: true,
        },
    ],
    "react/no-did-mount-set-state": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-string-refs": "error",
    "react/self-closing-comp": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
};
