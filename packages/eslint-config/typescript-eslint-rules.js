/* !
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
 */

module.exports = {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": [
        "error",
        {
            default: "array-simple",
        },
    ],
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-exports": [
        "error",
        {
            fixMixedExportsWithInlineTypeSpecifier: true,
        },
    ],
    "@typescript-eslint/consistent-type-imports": [
        "error",
        {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
        },
    ],
    "@typescript-eslint/dot-notation": "error",
    "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
            accessibility: "explicit",
            overrides: {
                constructors: "off",
            },
        },
    ],
    "@typescript-eslint/naming-convention": [
        "error",
        {
            format: ["PascalCase"],
            selector: "class",
        },
        {
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
            selector: "variable",
            modifiers: ["const", "global", "exported", "unused"],
            leadingUnderscore: "allow",
            trailingUnderscore: "forbid",
            custom: {
                regex: "^any$|^[Nn]umber$|^[Ss]tring$|^[Bb]oolean$|^[Uu]ndefined$",
                match: false,
            },
        },
    ],
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    "@typescript-eslint/no-deprecated": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-empty-object-type": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extraneous-class": [
        "error",
        {
            allowConstructorOnly: true,
            allowEmpty: true,
        },
    ],
    "@typescript-eslint/no-invalid-this": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-shadow": [
        "error",
        {
            hoist: "all",
        },
    ],
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-unnecessary-type-constraint": "error",
    "@typescript-eslint/no-unsafe-function-type": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/no-wrapper-object-types": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/triple-slash-reference": [
        "error",
        {
            path: "always",
            types: "prefer-import",
            lib: "always",
        },
    ],
    "@typescript-eslint/unbound-method": [
        "error",
        {
            ignoreStatic: true,
        },
    ],
    "@typescript-eslint/unified-signatures": "error",
};
