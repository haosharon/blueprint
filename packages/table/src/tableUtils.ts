/*
 * Copyright 2021 Palantir Technologies, Inc. All rights reserved.
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

import type { HotkeyConfig } from "@blueprintjs/core";

import type { ColumnProps } from "./column";
import { FocusMode } from "./common/cellTypes";
import { getFocusModeFromProps } from "./common/internal/focusedCellUtils";
import { Utils } from "./common/utils";
import { RegionCardinality } from "./regions";
import type { TableHotkeys } from "./tableHotkeys";
import type { TablePropsWithDefaults } from "./tableProps";

export function clampNumFrozenColumns(props: TablePropsWithDefaults) {
    const { numFrozenColumns } = props;
    const numColumns = React.Children.count(props.children);
    return maybeClampValue(numFrozenColumns, numColumns);
}

export function clampNumFrozenRows(props: TablePropsWithDefaults) {
    const { numFrozenRows, numRows } = props;
    return maybeClampValue(numFrozenRows, numRows);
}

function maybeClampValue(value: number | undefined, max: number) {
    return value === undefined ? 0 : Utils.clamp(value, 0, max);
}

export function hasLoadingOption(loadingOptions: string[] | undefined, loadingOption: string) {
    if (loadingOptions === undefined) {
        return false;
    }
    return loadingOptions.indexOf(loadingOption) >= 0;
}

export function isSelectionModeEnabled(
    props: TablePropsWithDefaults,
    selectionMode: RegionCardinality,
    selectionModes = props.selectionModes,
): boolean {
    const { children, numRows } = props;
    const numColumns = React.Children.count(children);
    return selectionModes.indexOf(selectionMode) >= 0 && numRows > 0 && numColumns > 0;
}

export function getHotkeysFromProps(props: TablePropsWithDefaults, hotkeysImpl: TableHotkeys): HotkeyConfig[] {
    const { getCellClipboardData, enableMultipleSelection, selectionModes } = props;
    const focusMode = getFocusModeFromProps(props);
    const hotkeys: HotkeyConfig[] = [];

    if (getCellClipboardData != null) {
        hotkeys.push({
            combo: "mod+c",
            group: "Table",
            label: "Copy selected table cells",
            onKeyDown: hotkeysImpl.handleCopy,
        });
    }

    const isSomeSelectionModeEnabled = selectionModes.length > 0;
    if (enableMultipleSelection && isSomeSelectionModeEnabled) {
        hotkeys.push(
            {
                combo: "shift+up",
                group: "Table",
                label: "Resize selection upward",
                onKeyDown: hotkeysImpl.handleSelectionResizeUp,
            },
            {
                combo: "shift+down",
                group: "Table",
                label: "Resize selection downward",
                onKeyDown: hotkeysImpl.handleSelectionResizeDown,
            },
            {
                combo: "shift+left",
                group: "Table",
                label: "Resize selection leftward",
                onKeyDown: hotkeysImpl.handleSelectionResizeLeft,
            },
            {
                combo: "shift+right",
                group: "Table",
                label: "Resize selection rightward",
                onKeyDown: hotkeysImpl.handleSelectionResizeRight,
            },
        );
    }

    hotkeys.push(...getFocusHotkeys(focusMode, hotkeysImpl));

    if (isSelectionModeEnabled(props, RegionCardinality.FULL_TABLE)) {
        hotkeys.push({
            combo: "mod+a",
            group: "Table",
            label: "Select all",
            onKeyDown: hotkeysImpl.handleSelectAllHotkey,
        });
    }

    return hotkeys;
}

function getFocusHotkeys(focusMode: FocusMode | undefined, hotkeysImpl: TableHotkeys): HotkeyConfig[] {
    switch (focusMode) {
        case undefined:
            return [];
        case FocusMode.ROW:
            return [
                {
                    combo: "up",
                    group: "Table",
                    label: "Move focus row up",
                    onKeyDown: hotkeysImpl.handleFocusMoveUp,
                },
                {
                    combo: "down",
                    group: "Table",
                    label: "Move focus row down",
                    onKeyDown: hotkeysImpl.handleFocusMoveDown,
                },
            ];
        case FocusMode.CELL:
            return [
                {
                    combo: "left",
                    group: "Table",
                    label: "Move focus cell left",
                    onKeyDown: hotkeysImpl.handleFocusMoveLeft,
                },
                {
                    combo: "right",
                    group: "Table",
                    label: "Move focus cell right",
                    onKeyDown: hotkeysImpl.handleFocusMoveRight,
                },
                {
                    combo: "up",
                    group: "Table",
                    label: "Move focus cell up",
                    onKeyDown: hotkeysImpl.handleFocusMoveUp,
                },
                {
                    combo: "down",
                    group: "Table",
                    label: "Move focus cell down",
                    onKeyDown: hotkeysImpl.handleFocusMoveDown,
                },
                {
                    allowInInput: true,
                    combo: "tab",
                    group: "Table",
                    label: "Move focus cell tab",
                    onKeyDown: hotkeysImpl.handleFocusMoveRightInternal,
                },
                {
                    allowInInput: true,
                    combo: "shift+tab",
                    group: "Table",
                    label: "Move focus cell shift tab",
                    onKeyDown: hotkeysImpl.handleFocusMoveLeftInternal,
                },
                {
                    allowInInput: true,
                    combo: "enter",
                    group: "Table",
                    label: "Move focus cell enter",
                    onKeyDown: hotkeysImpl.handleFocusMoveDownInternal,
                },
                {
                    allowInInput: true,
                    combo: "shift+enter",
                    group: "Table",
                    label: "Move focus cell shift enter",
                    onKeyDown: hotkeysImpl.handleFocusMoveUpInternal,
                },
            ];
    }
}

/**
 * @returns true if new and old children arrays are the same
 */
export function compareChildren(
    newChildren: Array<React.ReactElement<ColumnProps>>,
    oldChildren: Array<React.ReactElement<ColumnProps>>,
): boolean {
    return (
        newChildren.length === oldChildren.length &&
        newChildren.every((child, index) => child.key === oldChildren[index].key)
    );
}
