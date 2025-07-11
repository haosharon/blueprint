/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { addImportToFile } from "./utils/addImportToFile";
import { createRule } from "./utils/createRule";
import { FixList } from "./utils/fixList";
import { getProgram } from "./utils/getProgram";

// find all pt- prefixed classes, except those that begin with pt-icon (handled by other rules).
// currently supports "pt-", "bp3-", "bp4-", "bp5-", "bp6-" prefixes.
const BLUEPRINT_CLASSNAME_PATTERN = /(?<![\w])((?:pt|bp3|bp4|bp5|bp6)-(?!icon)[\w-]+)/g;

type MessageIds = "useBlueprintClasses";

/* eslint-disable sort-keys */
export const classesConstantsRule = createRule<[], MessageIds>({
    name: "classes-constants",
    meta: {
        docs: {
            description: "Enforce usage of Classes constants over namespaced string literals.",
            recommended: true,
            requiresTypeChecking: false,
        },
        fixable: "code",
        messages: {
            useBlueprintClasses: "use Blueprint `Classes` constant instead of string literal",
        },
        schema: [],
        type: "suggestion",
    },
    defaultOptions: [],
    create: context => ({
        "Literal, TemplateElement": node => create(context, node),
    }),
});

function create(
    context: TSESLint.RuleContext<MessageIds, []>,
    node: TSESTree.Literal | TSESTree.TemplateElement,
): void {
    // We shouldn't lint on strings from imports/exports
    if (
        node.parent?.type === AST_NODE_TYPES.ImportDeclaration ||
        node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration
    ) {
        return;
    }
    const nodeValue = node.type === AST_NODE_TYPES.Literal ? node.raw : node.value.raw;
    const prefixMatches = getAllMatches(nodeValue);
    if (prefixMatches.length > 0) {
        const ptClassStrings = prefixMatches.map(m => m.match);
        const replacementText =
            node.type === AST_NODE_TYPES.Literal
                ? // "string literal" likely becomes `${template} string` so we may need to change how it is assigned
                  wrapForParent(getLiteralReplacement(nodeValue, prefixMatches), node)
                : getTemplateReplacement(nodeValue, ptClassStrings);
        context.report({
            messageId: "useBlueprintClasses",
            node,
            fix: fixer => {
                const fixes = new FixList();

                fixes.addFixes(fixer.replaceText(node, replacementText));

                // Add import for the Classes enum
                const program = getProgram(node);
                if (program !== undefined) {
                    fixes.addFixes(addImportToFile(program, ["Classes"], "@blueprintjs/core")(fixer));
                }

                return fixes.getFixes();
            },
        });
    }
}

function getAllMatches(className: string) {
    const ptMatches = [];
    let currentMatch: RegExpExecArray | null;

    while ((currentMatch = BLUEPRINT_CLASSNAME_PATTERN.exec(className)) != null) {
        ptMatches.push({ match: currentMatch[1], index: currentMatch.index || 0 });
    }
    return ptMatches;
}

/** Produce replacement text for a string literal that contains invalid classes. */
function getLiteralReplacement(className: string, prefixMatches: Array<{ match: string; index: number }>) {
    // Special case: the string consists entirely of the invalid class name (ignoring quotes/spaces)
    // In this scenario, we just want to return the converted classnames without surrounding with ${} for interpolation
    if (prefixMatches.length === 1) {
        const remainingString = className
            .replace(prefixMatches[0].match, "")
            .slice(1, -1)
            .replace(/(\s)+/, "$1")
            .trim();
        if (remainingString.length === 0) {
            return convertPtClassName(prefixMatches[0].match);
        }
    }

    // Start with the beginning of the string until the first match of an invalid classname
    let newString = "";
    let currentIndex = 0;
    for (const { match, index } of prefixMatches) {
        // Add the strings between the currentIndex and this invalid class name's index
        newString += className.slice(currentIndex, index);
        // Add the converted string instead of the original string
        newString += `\${${convertPtClassName(match)}}`;
        // Update the index to immediately after this invalid class name
        currentIndex = index + match.length;
    }
    // Add remaining parts of string that occurred after the last invalid class name
    newString += className.slice(currentIndex, className.length);
    // Slice off the quotes, and merge & trim any remaining white space
    newString = newString.slice(1, -1).replace(/(\s)+/, "$1").trim();
    // Surround with backticks instead for the newly added template strings
    return `\`${newString}\``;
}

/** Produce replacement text for a `template string` that contains invalid classes. */
function getTemplateReplacement(className: string, ptClassStrings: string[]) {
    const templateString = ptClassStrings.reduce((value, cssClass) => {
        return value === cssClass
            ? // if the class is the only contents, we can remove the template
              `${convertPtClassName(cssClass)}`
            : value.replace(cssClass, `\${${convertPtClassName(cssClass)}}`);
    }, className);

    // if the result has a template string inside of it, surround it with backticks
    return templateString.includes("${") ? `\`${templateString}\`` : templateString;
}

/** Wrap the given statement based on the type of the parent node: JSX props, expressions, etc. */
function wrapForParent(statement: string, node: TSESTree.Node) {
    const { parent } = node;
    if (parent === undefined) {
        return statement;
    } else if (parent.type === AST_NODE_TYPES.JSXAttribute) {
        return `{${statement}}`;
    } else if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
        return `[${statement}]`;
    } else {
        return statement;
    }
}

/** Converts a `pt-class-name` literal to `Classes.CLASS_NAME` constant. */
function convertPtClassName(text: string) {
    const className = text
        .replace(/(pt|bp3|bp4|bp5|bp6)-/, "")
        .replace(/-/g, "_")
        .toUpperCase();
    return `Classes.${className}`;
}
