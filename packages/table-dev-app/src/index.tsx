/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
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

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { HotkeysProvider, OverlaysProvider } from "@blueprintjs/core";

import { MutableTable } from "./mutableTable";
import { Nav } from "./nav";

const navRoot = ReactDOM.createRoot(document.getElementById("nav"));
navRoot.render(<Nav selected="index" />);

const contentRoot = ReactDOM.createRoot(document.getElementById("page-content"));
contentRoot.render(
    <OverlaysProvider>
        <HotkeysProvider>
            <MutableTable />
        </HotkeysProvider>
    </OverlaysProvider>,
);
