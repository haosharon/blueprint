/*
 * Copyright 2019 Palantir Technologies, Inc. All rights reserved.
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

// HACKHACK: workaround to satisfy TS compiler, we need a direct type reference to be able to infer TSESLint.RuleModule
// @ts-expect-error
import type { TSESLint } from "@typescript-eslint/utils";

import { classesConstantsRule } from "./classes-constants";
import { htmlComponentsRule } from "./html-components";
import { iconComponentsRule } from "./icon-components";
import {
    noDeprecatedComponentsRule,
    noDeprecatedCoreComponentsRule,
    noDeprecatedDatetime2ComponentsRule,
    noDeprecatedSelectComponentsRule,
    noDeprecatedTableComponentsRule,
} from "./no-deprecated-components";
import { noDeprecatedTypeReferencesRule } from "./no-deprecated-type-references";

// eslint-disable-next-line import/no-default-export
export default {
    "classes-constants": classesConstantsRule,
    "html-components": htmlComponentsRule,
    "icon-components": iconComponentsRule,
    "no-deprecated-components": noDeprecatedComponentsRule,
    "no-deprecated-core-components": noDeprecatedCoreComponentsRule,
    "no-deprecated-datetime2-components": noDeprecatedDatetime2ComponentsRule,
    "no-deprecated-select-components": noDeprecatedSelectComponentsRule,
    "no-deprecated-table-components": noDeprecatedTableComponentsRule,
    "no-deprecated-type-references": noDeprecatedTypeReferencesRule,
};
