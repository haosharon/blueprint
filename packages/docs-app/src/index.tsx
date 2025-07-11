/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
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

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { docsData } from "@blueprintjs/docs-data";
import {
    createDefaultRenderers,
    ReactCodeExampleTagRenderer,
    ReactDocsTagRenderer,
    ReactExampleTagRenderer,
} from "@blueprintjs/docs-theme";
import { Icons } from "@blueprintjs/icons";

import { BlueprintDocs } from "./components/blueprintDocs";
import * as ReactDocs from "./tags/reactDocs";
import { reactExamples } from "./tags/reactExamples";

// load all icons up front so that they do not experience a flash of unstyled content (but we don't need to block on this promise)
Icons.loadAll();

const reactCodeExample = new ReactCodeExampleTagRenderer(reactExamples);
const reactDocs = new ReactDocsTagRenderer(ReactDocs as any);
const reactExample = new ReactExampleTagRenderer(reactExamples);

const tagRenderers = {
    ...createDefaultRenderers(),
    reactCodeExample: reactCodeExample.render,
    reactDocs: reactDocs.render,
    reactExample: reactExample.render,
};

const container = document.getElementById("blueprint-documentation");
const root = ReactDOM.createRoot(container);
root.render(
    <BlueprintDocs defaultPageId="blueprint" docs={docsData} tagRenderers={tagRenderers} useNextVersion={false} />,
);
