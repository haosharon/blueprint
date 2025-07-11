/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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

// @ts-check

import "@blueprintjs/test-commons/bootstrap";
import React from "react";

import { generateIsomorphicTests } from "@blueprintjs/test-commons";

import Core from "../lib/cjs/index.js";

const requiredChild = React.createElement("button");
const EXAMPLE_HOTKEY_CONFIG = { combo: "mod+s", global: true, label: "save" };

describe("@blueprintjs/core isomorphic rendering", () => {
    generateIsomorphicTests(
        Core,
        {
            Alert: {
                props: { isOpen: true, lazy: false, usePortal: false },
            },
            BlueprintProvider: {
                className: false,
            },
            Breadcrumbs: {
                props: { items: [] },
            },
            ContextMenu: {
                props: { children: React.createElement("div"), content: React.createElement("div") },
            },
            Dialog: {
                props: { isOpen: true, lazy: false, usePortal: false },
            },
            Drawer: {
                props: { isOpen: true, lazy: false, usePortal: false },
            },
            Hotkey: {
                props: EXAMPLE_HOTKEY_CONFIG,
            },
            Hotkeys: {
                children: React.createElement(Core.Hotkey, EXAMPLE_HOTKEY_CONFIG),
            },
            HotkeysDialog2: {
                props: {
                    hotkeys: [EXAMPLE_HOTKEY_CONFIG],
                    isOpen: true,
                    lazy: false,
                    usePortal: false,
                },
            },
            HotkeysProvider: {
                className: false,
            },
            HotkeysTarget: {
                props: {
                    hotkeys: [EXAMPLE_HOTKEY_CONFIG],
                },
                children: requiredChild,
                className: false,
            },
            HotkeysTarget2: {
                skip: true,
            },
            Icon: {
                props: { icon: "build" },
            },
            MultiSliderHandle: {
                skip: true,
            },
            MultistepDialog: {
                props: { isOpen: true, lazy: false, usePortal: false },
                children: React.createElement(Core.DialogStep, {
                    key: 1,
                    id: 1,
                    title: "Step one",
                    panel: React.createElement("div"),
                }),
            },
            KeyComboTag: {
                props: { combo: "?" },
            },
            OverflowList: {
                props: { items: [], overflowRenderer: () => null, visibleItemRenderer: () => null },
            },
            Overlay: {
                props: { lazy: false, usePortal: false },
            },
            Overlay2: {
                props: { lazy: false, usePortal: false },
            },
            OverlaysProvider: {
                className: false,
            },
            OverlayToaster: {
                props: { usePortal: false },
                children: React.createElement(Core.Toast, { message: "Toast" }),
            },
            PanelStack: {
                props: {
                    initialPanel: { renderPanel: () => null, props: {}, title: "" },
                },
                children: "",
            },
            PanelStack2: {
                skip: true,
            },
            Portal: {
                className: false, // only renders in browser (`document`)
            },
            Popover: {
                children: requiredChild,
            },
            PortalProvider: {
                className: false,
            },
            ResizeSensor: {
                children: requiredChild,
                className: false,
            },
            Tabs: {
                children: React.createElement(Core.Tab, { key: 1, id: 1, title: "Tab one" }),
            },
            TabsExpander: {
                className: false,
            },
            TagInput: {
                props: { values: ["foo", "bar", "baz"] },
            },
            Tooltip: {
                props: { content: React.createElement("h1", {}, "content") },
                children: requiredChild,
            },
        },
        {
            excludedSymbols: [
                "AbstractComponent",
                "AbstractPureComponent",
                "ContextMenuTargetLegacy",
                "Expander",
                "HotkeysTarget",
                "TabPanel",
            ],
        },
    );
});
