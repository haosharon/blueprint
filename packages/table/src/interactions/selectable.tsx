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

import { Utils as CoreUtils, DISPLAYNAME_PREFIX } from "@blueprintjs/core";

import { type FocusedCellCoordinates, type FocusedRegion, FocusMode } from "../common/cellTypes";
import * as DefaultFocusedCellUtils from "../common/internal/focusedCellUtils";
import * as PlatformUtils from "../common/internal/platformUtils";
import { Utils } from "../common/utils";
import { type Region, Regions } from "../regions";

import { DragEvents } from "./dragEvents";
import { Draggable } from "./draggable";
import type { CoordinateData, DraggableChildrenProps, DragHandler } from "./dragTypes";

export type SelectedRegionTransform = (
    region: Region,
    event: MouseEvent | KeyboardEvent,
    coords?: CoordinateData,
) => Region;

export interface SelectableProps {
    /**
     * If `false`, only a single region of a single column/row/cell may be
     * selected at one time. Using `ctrl` or `meta` key will have no effect,
     * and a mouse drag will select the current column/row/cell only.
     *
     * @default false
     */
    enableMultipleSelection?: boolean;

    /**
     * The currently focused cell.
     *
     * @deprecated Use `focusedRegion` and `focusMode` instead.
     */
    focusedCell?: FocusedCellCoordinates;

    /**
     * The currently focused region.
     */
    focusedRegion?: FocusedRegion;

    /**
     * The the type shape allowed for focus areas. Can be cell, row, or none.
     */
    focusMode?: FocusMode | undefined;

    /**
     * Focused cell coordinate & region utility functions. Exposed as a prop for testing purposes.
     * These custom properties will be merged with the default util implementations.
     *
     * @internal
     */
    focusedCellUtils?: Partial<typeof DefaultFocusedCellUtils>;

    /**
     * When the user focuses something, this callback is called with new
     * focused cell coordinates. This should be considered the new focused cell
     * state for the entire table.
     *
     * @deprecated Use `onFocusedRegion` instead
     */
    onFocusedCell?: (focusedCell: FocusedCellCoordinates) => void;

    /**
     * When the user focuses something, this callback is called with new
     * focused cell coordinates. This should be considered the new focused cell
     * state for the entire table.
     */
    onFocusedRegion?: (focusedRegion: FocusedRegion) => void;

    /**
     * When the user selects something, this callback is called with a new
     * array of `Region`s. This array should be considered the new selection
     * state for the entire table.
     */
    onSelection: (regions: Region[]) => void;

    /**
     * An additional convenience callback invoked when the user releases the
     * mouse from either a click or a drag, indicating that the selection
     * interaction has ended.
     */
    onSelectionEnd?: (regions: Region[]) => void;

    /**
     * An array containing the table's selection Regions.
     *
     * @default []
     */
    selectedRegions?: Region[];

    /**
     * An optional transform function that will be applied to the located
     * `Region`.
     *
     * This allows you to, for example, convert cell `Region`s into row
     * `Region`s while maintaining the existing multi-select and meta-click
     * functionality.
     */
    selectedRegionTransform?: SelectedRegionTransform;
}

export interface DragSelectableProps extends SelectableProps, DraggableChildrenProps {
    /**
     * A list of CSS selectors that should _not_ trigger selection when a `mousedown` occurs inside of them.
     */
    ignoredSelectors?: string[];

    /**
     * Whether the selection behavior is disabled.
     *
     * @default false
     */
    disabled?: boolean | ((event: MouseEvent) => boolean);

    /**
     * A callback that determines a `Region` for the single `MouseEvent`. If
     * no valid region can be found, `null` may be returned.
     */
    locateClick: (event: MouseEvent) => Region;

    /**
     * A callback that determines a `Region` for the `MouseEvent` and
     * coordinate data representing a drag. If no valid region can be found,
     * `null` may be returned.
     */
    locateDrag: (event: MouseEvent, coords: CoordinateData, returnEndOnly?: boolean) => Region | undefined;
}

export class DragSelectable extends React.PureComponent<DragSelectableProps> {
    public static defaultProps: Partial<DragSelectableProps> = {
        disabled: false,
        enableMultipleSelection: false,
        selectedRegions: [],
    };

    public static displayName = `${DISPLAYNAME_PREFIX}.DragSelectable`;

    private get focusedCellUtils() {
        return {
            ...DefaultFocusedCellUtils,
            ...this.props.focusedCellUtils,
        };
    }

    private didExpandSelectionOnActivate = false;

    private lastEmittedSelectedRegions: Region[] | null = null;

    public render() {
        const draggableProps = this.getDraggableHandlers();
        return (
            <Draggable {...draggableProps} preventDefault={false} targetRef={this.props.targetRef}>
                {this.props.children}
            </Draggable>
        );
    }

    private getDraggableHandlers(): DragHandler {
        return this.props.onSelection == null
            ? {}
            : {
                  onActivate: this.handleActivate,
                  onClick: this.handleClick,
                  onDragEnd: this.handleDragEnd,
                  onDragMove: this.handleDragMove,
              };
    }

    private handleActivate = (event: MouseEvent) => {
        const { locateClick, selectedRegions, selectedRegionTransform } = this.props;
        if (this.shouldIgnoreMouseDown(event)) {
            return false;
        }

        let region = locateClick(event);

        if (!Regions.isValid(region)) {
            return false;
        }

        if (selectedRegionTransform != null) {
            region = selectedRegionTransform(region, event);
        }

        const foundIndex = Regions.findMatchingRegion(selectedRegions!, region);
        const matchesExistingSelection = foundIndex !== -1;

        if (matchesExistingSelection && DragEvents.isAdditive(event)) {
            this.handleClearSelectionAtIndex(foundIndex);
            // if we just deselected a selected region, a subsequent drag-move
            // could reselect it again and *also* clear other selections. that's
            // quite unintuitive, so ignore subsequent drag-move's.
            return false;
        }

        // we want to listen to subsequent drag-move's in all following cases,
        // so this mousedown can be the start of a new selection if desired.
        if (matchesExistingSelection) {
            this.handleClearAllSelectionsNotAtIndex(foundIndex);
        } else if (this.shouldExpandSelection(event)) {
            this.handleExpandSelection(region);
        } else if (this.shouldAddDisjointSelection(event)) {
            this.handleAddDisjointSelection(region);
        } else {
            this.handleReplaceSelection(region);
        }
        return true;
    };

    private handleDragMove = (event: MouseEvent, coords: CoordinateData) => {
        const { enableMultipleSelection, locateClick, locateDrag, selectedRegions, selectedRegionTransform } =
            this.props;

        let region = enableMultipleSelection
            ? locateDrag(event, coords, /* returnEndOnly? */ this.didExpandSelectionOnActivate)
            : locateClick(event);

        if (region === undefined || !Regions.isValid(region)) {
            return;
        } else if (selectedRegionTransform != null) {
            region = selectedRegionTransform(region, event, coords);
        }

        const nextSelectedRegions = this.didExpandSelectionOnActivate
            ? this.expandSelectedRegions(selectedRegions!, region, this.getFocusedRegion())
            : Regions.update(selectedRegions!, region);

        this.maybeInvokeSelectionCallback(nextSelectedRegions);

        if (!enableMultipleSelection) {
            // move the focused cell with the selected region
            const lastIndex = nextSelectedRegions.length - 1;
            const mostRecentRegion = nextSelectedRegions[lastIndex];
            this.invokeOnFocusCallbackForRegion(mostRecentRegion, lastIndex);
        }
    };

    private handleDragEnd = () => {
        this.finishInteraction();
    };

    private handleClick = () => {
        this.finishInteraction();
    };

    // Boolean checks
    // ==============

    private shouldExpandSelection = (event: MouseEvent) => {
        const { enableMultipleSelection } = this.props;
        return enableMultipleSelection && event.shiftKey;
    };

    private shouldAddDisjointSelection = (event: MouseEvent) => {
        const { enableMultipleSelection } = this.props;
        return enableMultipleSelection && DragEvents.isAdditive(event);
    };

    private shouldIgnoreMouseDown(event: MouseEvent) {
        const { disabled, ignoredSelectors = [] } = this.props;
        const element = event.target as HTMLElement;

        const isLeftClick = Utils.isLeftClick(event);
        const isContextMenuTrigger = isLeftClick && event.ctrlKey && PlatformUtils.isMac();
        const isDisabled = typeof disabled === "function" ? disabled(event) : disabled;

        return (
            !isLeftClick ||
            isContextMenuTrigger ||
            isDisabled ||
            ignoredSelectors.some((selector: string) => element.closest(selector) != null)
        );
    }

    // Update logic
    // ============

    private handleClearSelectionAtIndex = (selectedRegionIndex: number) => {
        const { selectedRegions } = this.props;

        // remove just the clicked region, leaving other selected regions in place
        const nextSelectedRegions = selectedRegions!.slice();
        nextSelectedRegions.splice(selectedRegionIndex, 1);
        this.maybeInvokeSelectionCallback(nextSelectedRegions);

        // if there are still any selections, move the focused cell to the
        // most recent selection. otherwise, don't update it.
        if (nextSelectedRegions.length > 0) {
            const lastIndex = nextSelectedRegions.length - 1;
            this.invokeOnFocusCallbackForRegion(nextSelectedRegions[lastIndex], lastIndex);
        }
    };

    private handleClearAllSelectionsNotAtIndex = (selectedRegionIndex: number) => {
        const { selectedRegions } = this.props;

        const nextSelectedRegion = selectedRegions![selectedRegionIndex];
        this.maybeInvokeSelectionCallback([nextSelectedRegion]);
        this.invokeOnFocusCallbackForRegion(nextSelectedRegion, 0);
    };

    private handleExpandSelection = (region: Region) => {
        const { selectedRegions } = this.props;
        this.didExpandSelectionOnActivate = true;

        // there should be only one selected region after expanding. do not
        // update the focused cell.
        const nextSelectedRegions = this.expandSelectedRegions(selectedRegions!, region, this.getFocusedRegion());
        this.maybeInvokeSelectionCallback(nextSelectedRegions);

        // move the focused cell into the new region if there were no selections before
        if (selectedRegions == null || selectedRegions.length === 0) {
            this.invokeOnFocusCallbackForRegion(region);
        }
    };

    private handleAddDisjointSelection = (region: Region) => {
        const { selectedRegions } = this.props;

        // add the new region to the existing selections
        const nextSelectedRegions = Regions.add(selectedRegions!, region);
        this.maybeInvokeSelectionCallback(nextSelectedRegions);

        // put the focused cell in the new region
        this.invokeOnFocusCallbackForRegion(region, nextSelectedRegions.length - 1);
    };

    private handleReplaceSelection = (region: Region) => {
        // clear all selections and retain only the new one
        const nextSelectedRegions = [region];
        this.maybeInvokeSelectionCallback(nextSelectedRegions);

        // move the focused cell into the new selection
        this.invokeOnFocusCallbackForRegion(region);
    };

    // Callbacks
    // =========

    private maybeInvokeSelectionCallback(nextSelectedRegions: Region[]) {
        const { onSelection } = this.props;
        // invoke only if the selection changed. this is useful only on
        // mousemove; there's special handling for mousedown interactions that
        // target an already-selected region.
        if (
            this.lastEmittedSelectedRegions == null ||
            !CoreUtils.deepCompareKeys(this.lastEmittedSelectedRegions, nextSelectedRegions)
        ) {
            onSelection(nextSelectedRegions);
            this.lastEmittedSelectedRegions = nextSelectedRegions;
        }
    }

    private invokeOnFocusCallbackForRegion = (focusRegion: Region, focusSelectionIndex = 0) => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const { focusMode, onFocusedCell, onFocusedRegion } = this.props;
        const focusedCellCoords = Regions.getFocusCellCoordinatesFromRegion(focusRegion);
        const newFocusedRegion = this.focusedCellUtils.toFocusedRegion(
            focusMode,
            focusedCellCoords,
            focusSelectionIndex,
        );

        if (newFocusedRegion != null) {
            onFocusedRegion?.(newFocusedRegion);
        }

        // Keep this call for backward compatibility
        onFocusedCell?.(this.focusedCellUtils.toFocusedRegion(FocusMode.CELL, focusedCellCoords, focusSelectionIndex));
    };

    // Other
    // =====

    private finishInteraction = () => {
        this.props.onSelectionEnd?.(this.props.selectedRegions!);
        this.didExpandSelectionOnActivate = false;
        this.lastEmittedSelectedRegions = null;
    };

    /**
     * Expands the last-selected region to the new region, and replaces the
     * last-selected region with the expanded region. If a focused cell is provided,
     * the focused cell will serve as an anchor for the expansion.
     */
    private expandSelectedRegions(regions: Region[], region: Region, focusedRegion?: FocusedRegion) {
        if (regions.length === 0) {
            return [region];
        } else if (focusedRegion != null) {
            const expandedRegion = this.focusedCellUtils.expandFocusedRegion(focusedRegion, region);
            return Regions.update(regions, expandedRegion);
        } else {
            const expandedRegion = Regions.expandRegion(regions[regions.length - 1], region);
            return Regions.update(regions, expandedRegion);
        }
    }

    private getFocusedRegion(): FocusedRegion | undefined {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const { focusedCell, focusedRegion } = this.props;
        if (focusedRegion != null) {
            return focusedRegion;
        }

        if (focusedCell != null) {
            return { ...focusedCell, type: FocusMode.CELL };
        }

        return undefined;
    }
}
