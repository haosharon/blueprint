/*
 * Copyright 2021 Palantir Technologies, Inc. All rights reserved.
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

import type { Props } from "@blueprintjs/core";

import type { CellRenderer } from "./cell/cell";
import type { ColumnProps } from "./column";
import type { FocusedCellCoordinates, FocusedRegion, FocusMode } from "./common/cellTypes";
import type { ColumnIndices, RowIndices } from "./common/grid";
import type { RenderMode } from "./common/renderMode";
import type { ColumnWidths } from "./headers/columnHeader";
import type { RowHeaderRenderer, RowHeights } from "./headers/rowHeader";
import type { ContextMenuRenderer } from "./interactions/menus";
import type { IndexedResizeCallback } from "./interactions/resizable";
import type { SelectedRegionTransform } from "./interactions/selectable";
import type { Region, RegionCardinality, StyledRegionGroup, TableLoadingOption } from "./regions";

/** @deprecated Use `TableProps` instead */
export type Table2Props = TableProps;

export interface TableProps extends Props, Partial<RowHeights>, Partial<ColumnWidths> {
    /**
     * This dependency list may be used to trigger a re-render of all cells when one of its elements changes
     * (compared using shallow equality checks). This is done by invalidating the grid, which forces
     * TableQuadrantStack to re-render.
     */
    cellRendererDependencies?: React.DependencyList;

    /**
     * The children of a `Table` component, which must be React elements
     * that use `ColumnProps`.
     */
    children?: React.ReactElement<ColumnProps> | Array<React.ReactElement<ColumnProps>>;

    /**
     * A sparse number array with a length equal to the number of columns. Any
     * non-null value will be used to set the width of the column at the same
     * index. Note that if you want to update these values when the user
     * drag-resizes a column, you may define a callback for `onColumnWidthChanged`.
     */
    columnWidths?: Array<number | null | undefined>;

    /**
     * An optional callback for displaying a context menu when right-clicking
     * on the table body. The callback is supplied with an array of
     * `Region`s. If the mouse click was on a selection, the array will
     * contain all selected regions. Otherwise it will have one `Region` that
     * represents the clicked cell.
     */
    bodyContextMenuRenderer?: ContextMenuRenderer;

    /**
     * Whether the body context menu is enabled.
     *
     * @default true if bodyContextMenuRenderer is defined
     */
    enableBodyContextMenu?: boolean;

    /**
     * If `true`, adds an interaction bar on top of all column header cells, and
     * moves interaction triggers into it.
     *
     * @default false
     */
    enableColumnInteractionBar?: boolean;

    /**
     * If `false`, disables reordering of columns.
     *
     * @default false
     */
    enableColumnReordering?: boolean;

    /**
     * If `false`, disables resizing of columns.
     *
     * @default true
     */
    enableColumnResizing?: boolean;

    /**
     * If `true`, there will be a single "focused" cell at all times,
     * which can be used to interact with the table as though it is a
     * spreadsheet. When false, no such cell will exist.
     *
     * @deprecated When using `Table2`, use the `focusMode` prop instead.
     *
     * @default false
     */
    enableFocusedCell?: boolean;

    /**
     * If `true`, empty space in the table container will be filled with empty
     * cells instead of a blank background.
     *
     * @default false
     */
    enableGhostCells?: boolean;

    /**
     * If `false`, only a single region of a single column/row/cell may be
     * selected at one time. Using `ctrl` or `meta` key will have no effect,
     * and a mouse drag will select the current column/row/cell only.
     *
     * @default true
     */
    enableMultipleSelection?: boolean;

    /**
     * If `false`, hides the row headers and settings menu.
     *
     * @default true
     */
    enableRowHeader?: boolean;

    /**
     * If `false`, disables reordering of rows.
     *
     * @default false
     */
    enableRowReordering?: boolean;

    /**
     * If `false`, disables resizing of rows.
     *
     * @default true
     */
    enableRowResizing?: boolean;

    /**
     * If defined, will set the focused cell state. This changes
     * the focused cell to controlled mode, meaning you are in charge of
     * setting the focus in response to events in the `onFocusedCell` callback.
     *
     * @deprecated When using `Table2`, use the `focusedRegion` prop instead
     */
    focusedCell?: FocusedCellCoordinates;

    /**
     * If defined, will set the focused region state. This changes the focused
     * region to controlled mode, meaning yo uare in charge of setting the focus
     * in response to events in the `onFocusedRegion` callback. The shape of
     * the region is defined by the `focusMode` prop.
     *
     * This API is only supported on `Table2`. When using `Table`, use
     * `focusedCell` and `onFocusedCell instead.
     */
    focusedRegion?: FocusedRegion;

    /**
     * If this is defined, there will be a single focused cell or row
     * at all times which can be used to interact with the table as
     * though it is a spread sheet. The type of allowed focus area
     * is given by the value. If undefined is passed, then this focus
     * state will be disabled.
     *
     * This API is only supported on `Table2`. When using `Table`, use
     * `enableFocusedCell` instead.
     *
     * @default undefined
     */
    focusMode?: FocusMode;

    /**
     * If `true`, selection state changes will cause the component to re-render.
     * If `false`, selection state is ignored when deciding to re-render.
     *
     * @default false
     */
    forceRerenderOnSelectionChange?: boolean;

    /**
     * If defined, this callback will be invoked for each cell when the user
     * attempts to copy a selection via `mod+c`. The returned data will be copied
     * to the clipboard and need not match the display value of the `<Cell>`.
     * The data will be invisibly added as `textContent` into the DOM before
     * copying. If not defined, a default implementation will be used that
     * turns the rendered cell elements into strings using 'react-innertext'.
     *
     * @param row the row index coordinate of the cell to get data for
     * @param col the col index coordinate of the cell to get data for
     * @param cellRenderer the cell renderer for this row, col coordinate in the table
     */
    getCellClipboardData?: (row: number, col: number, celRenderer: CellRenderer) => any;

    /**
     * A list of `TableLoadingOption`. Set this prop to specify whether to
     * render the loading state for the column header, row header, and body
     * sections of the table.
     */
    loadingOptions?: TableLoadingOption[];

    /**
     * The number of columns to freeze to the left side of the table, counting
     * from the leftmost column.
     *
     * @default 0
     */
    numFrozenColumns?: number;

    /**
     * The number of rows to freeze to the top of the table, counting from the
     * topmost row.
     *
     * @default 0
     */
    numFrozenRows?: number;

    /**
     * The number of rows in the table.
     */
    numRows?: number;

    /**
     * If reordering is enabled, this callback will be invoked when the user finishes
     * drag-reordering one or more columns.
     */
    onColumnsReordered?: (oldIndex: number, newIndex: number, length: number) => void;

    /**
     * If resizing is enabled, this callback will be invoked when the user
     * finishes drag-resizing a column.
     */
    onColumnWidthChanged?: IndexedResizeCallback;

    /**
     * An optional callback invoked when all cells in view have completely rendered.
     * Will be invoked on initial mount and whenever cells update (e.g., on scroll).
     */
    onCompleteRender?: () => void;

    /**
     * If you want to do something after the copy or if you want to notify the
     * user if a copy fails, you may provide this optional callback.
     *
     * Due to browser limitations, the copy can fail. This usually occurs if
     * the selection is too large, like 20,000+ cells. The copy will also fail
     * if the browser does not support the copy method (see
     * `Clipboard.isCopySupported`).
     */
    onCopy?: (success: boolean) => void;

    /**
     * A callback called when the focus is changed in the table.
     *
     * @deprecated When using `Table2`, use the `onFocusedRegion` prop instead
     */
    onFocusedCell?: (focusedCell: FocusedCellCoordinates) => void;

    /**
     * A callback called when the focused region is changed in the table.
     *
     * This API is only supported for `Table2`. When using `Table`, use
     * `onFocusedCell` instead.
     */
    onFocusedRegion?: (focusedRegion: FocusedRegion) => void;

    /**
     * If resizing is enabled, this callback will be invoked when the user
     * finishes drag-resizing a row.
     */
    onRowHeightChanged?: IndexedResizeCallback;

    /**
     * If reordering is enabled, this callback will be invoked when the user finishes
     * drag-reordering one or more rows.
     */
    onRowsReordered?: (oldIndex: number, newIndex: number, length: number) => void;

    /**
     * A callback called when the selection is changed in the table.
     */
    onSelection?: (selectedRegions: Region[]) => void;

    /**
     * A callback called when the visible cell indices change in the table.
     */
    onVisibleCellsChange?: (rowIndices: RowIndices, columnIndices: ColumnIndices) => void;

    /**
     * Dictates how cells should be rendered. Supported modes are:
     * - `RenderMode.BATCH`: renders cells in batches to improve performance
     * - `RenderMode.BATCH_ON_UPDATE`: renders cells synchronously on mount and
     *   in batches on update
     * - `RenderMode.NONE`: renders cells synchronously all at once
     *
     * @default RenderMode.BATCH_ON_UPDATE
     */
    renderMode?: RenderMode;

    /**
     * Render each row's header cell.
     */
    rowHeaderCellRenderer?: RowHeaderRenderer;

    /**
     * A sparse number array with a length equal to the number of rows. Any
     * non-null value will be used to set the height of the row at the same
     * index. Note that if you want to update these values when the user
     * drag-resizes a row, you may define a callback for `onRowHeightChanged`.
     */
    rowHeights?: Array<number | null | undefined>;

    /**
     * If defined, will set the selected regions in the cells. If defined, this
     * changes table selection to controlled mode, meaning you in charge of
     * setting the selections in response to events in the `onSelection`
     * callback.
     *
     * Note that the `selectionModes` prop controls which types of events are
     * triggered to the `onSelection` callback, but does not restrict what
     * selection you can pass to the `selectedRegions` prop. Therefore you can,
     * for example, convert cell clicks into row selections.
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

    /**
     * A `SelectionModes` enum value indicating the selection mode. You may
     * equivalently provide an array of `RegionCardinality` enum values for
     * precise configuration.
     *
     * The `SelectionModes` enum values are:
     * - `ALL`
     * - `NONE`
     * - `COLUMNS_AND_CELLS`
     * - `COLUMNS_ONLY`
     * - `ROWS_AND_CELLS`
     * - `ROWS_ONLY`
     *
     * The `RegionCardinality` enum values are:
     * - `FULL_COLUMNS`
     * - `FULL_ROWS`
     * - `FULL_TABLE`
     * - `CELLS`
     *
     * @default SelectionModes.ALL
     */
    selectionModes?: RegionCardinality[];

    /**
     * Styled region groups are rendered as overlays above the table and are
     * marked with their own `className` for custom styling.
     */
    styledRegionGroups?: StyledRegionGroup[];

    /**
     * If `false`, hides the column headers.
     *
     * @default true
     */
    enableColumnHeader?: boolean;
}

export type TablePropsDefaults = Required<
    Pick<
        TableProps,
        | "defaultColumnWidth"
        | "defaultRowHeight"
        | "enableColumnInteractionBar"
        | "enableFocusedCell"
        | "enableGhostCells"
        | "enableMultipleSelection"
        | "enableRowHeader"
        | "forceRerenderOnSelectionChange"
        | "getCellClipboardData"
        | "loadingOptions"
        | "maxColumnWidth"
        | "maxRowHeight"
        | "minColumnWidth"
        | "minRowHeight"
        | "numFrozenColumns"
        | "numFrozenRows"
        | "numRows"
        | "renderMode"
        | "rowHeaderCellRenderer"
        | "selectionModes"
        | "enableColumnHeader"
    >
>;

export type TablePropsWithDefaults = Omit<TableProps, keyof TablePropsDefaults> & TablePropsDefaults;
