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

import { expect } from "chai";
import { type MountRendererProps, type ReactWrapper, mount as untypedMount } from "enzyme";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import sinon from "sinon";

import { Utils as CoreUtils } from "@blueprintjs/core";
import { dispatchMouseEvent, expectPropValidationError } from "@blueprintjs/test-commons";

import { Cell, Column, RegionCardinality, Table, TableLoadingOption, type TableProps } from "../src";
import { type CellCoordinates, type FocusedCellCoordinates } from "../src/common/cellTypes";
import * as Classes from "../src/common/classes";
import * as Errors from "../src/common/errors";
import type { ColumnIndices, RowIndices } from "../src/common/grid";
import { RenderMode } from "../src/common/renderMode";
import { TableQuadrant } from "../src/quadrants/tableQuadrant";
import { TableQuadrantStack } from "../src/quadrants/tableQuadrantStack";
import { type Region, Regions } from "../src/regions";
import type { TableState } from "../src/tableState";

import { CellType, expectCellLoading } from "./cellTestUtils";
import { type ElementHarness, ReactHarness } from "./harness";
import { createStringOfLength, createTableOfSize } from "./mocks/table";

/* eslint-disable @typescript-eslint/no-deprecated */

/**
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26979#issuecomment-465304376
 */
const mount = (el: React.ReactElement<TableProps>, options?: MountRendererProps) => untypedMount<Table>(el, options);

describe("<Table>", function (this) {
    // allow retrying failed tests here to reduce flakes.
    this.retries(2);

    const COLUMN_HEADER_SELECTOR = `.${Classes.TABLE_QUADRANT_MAIN} .${Classes.TABLE_COLUMN_HEADERS} .${Classes.TABLE_HEADER}`;

    let containerElement: HTMLElement;
    const harness = new ReactHarness();

    beforeEach(() => {
        containerElement = document.createElement("div");
        document.body.appendChild(containerElement);
    });

    afterEach(() => {
        harness.unmount();
        containerElement.remove();
    });

    after(() => {
        harness.destroy();
    });

    describe("Basic rendering", () => {
        it("Defaults to Base26Alpha column names", () => {
            const table = harness.mount(
                <Table>
                    <Column />
                    <Column />
                    <Column name="My Name" />
                </Table>,
            );

            expect(table.find(`.${Classes.TABLE_COLUMN_NAME_TEXT}`, 2).text()).to.equal("My Name");
            expect(table.find(`.${Classes.TABLE_COLUMN_NAME_TEXT}`, 1).text()).to.equal("B");
        });

        it("Adds custom className to table container", () => {
            const CLASS_NAME = "my-custom-class-name";
            const table = harness.mount(
                <Table className={CLASS_NAME}>
                    <Column />
                    <Column />
                    <Column />
                </Table>,
            );
            const hasCustomClass = table.find(`.${Classes.TABLE_CONTAINER}`, 0)!.hasClass(CLASS_NAME);
            expect(hasCustomClass).to.be.true;
        });

        it("Renders without ghost cells", () => {
            const table = harness.mount(
                <Table>
                    <Column />
                </Table>,
            );
            expect(table.find(COLUMN_HEADER_SELECTOR, 0)!.element).to.be.ok;
            expect(table.find(COLUMN_HEADER_SELECTOR, 1)!.element).to.not.be.ok;
        });

        it("Renders ghost cells", () => {
            const table = harness.mount(
                <Table enableGhostCells={true}>
                    <Column />
                </Table>,
            );

            expect(table.find(COLUMN_HEADER_SELECTOR, 0)!.element).to.be.ok;
            expect(table.find(COLUMN_HEADER_SELECTOR, 1)!.element).to.be.ok;
        });

        it("Renders correctly with loading options", () => {
            const loadingOptions = [
                TableLoadingOption.CELLS,
                TableLoadingOption.COLUMN_HEADERS,
                TableLoadingOption.ROW_HEADERS,
            ];
            const tableHarness = harness.mount(
                <Table loadingOptions={loadingOptions} numRows={2}>
                    <Column name="Column0" cellRenderer={renderDummyCell} />
                    <Column name="Column1" cellRenderer={renderDummyCell} />
                </Table>,
            );

            expect(tableHarness.text()).to.equal("");

            const cells = Array.from(tableHarness.element!.querySelectorAll(`.${Classes.TABLE_CELL}`));
            cells.forEach(cell => expectCellLoading(cell, CellType.BODY_CELL));

            const columnHeaders = Array.from(tableHarness.element!.querySelectorAll(COLUMN_HEADER_SELECTOR));
            columnHeaders.forEach(columnHeader => expectCellLoading(columnHeader, CellType.COLUMN_HEADER));

            const rowHeaders = Array.from(
                tableHarness.element!.querySelectorAll(`.${Classes.TABLE_ROW_HEADERS} .${Classes.TABLE_HEADER}`),
            );
            rowHeaders.forEach(rowHeader => expectCellLoading(rowHeader, CellType.ROW_HEADER));
        });
    });

    describe("onVisibleCellsChange callback", () => {
        it("Invokes onVisibleCellsChange on mount", () => {
            const onVisibleCellsChange = sinon.spy();
            const cellRenderer = () => <Cell>foo</Cell>;
            mount(
                <Table onVisibleCellsChange={onVisibleCellsChange} numRows={3}>
                    <Column name="Column0" cellRenderer={cellRenderer} />
                </Table>,
            );

            // the callback is called quite often even in the course of a single render cycle.
            // don't bother to count the invocations.
            expect(onVisibleCellsChange.called).to.be.true;
            const rowIndices: RowIndices = { rowIndexEnd: 2, rowIndexStart: 0 };
            const columnIndices: ColumnIndices = { columnIndexEnd: 0, columnIndexStart: 0 };
            expect(onVisibleCellsChange.lastCall.calledWith(rowIndices, columnIndices)).to.be.true;
        });

        it("Invokes onVisibleCellsChange when the table body scrolls", () => {
            const onVisibleCellsChange = sinon.spy();
            const cellRenderer = () => <Cell>foo</Cell>;
            const table = mount(
                <Table onVisibleCellsChange={onVisibleCellsChange} numRows={3}>
                    <Column name="Column0" cellRenderer={cellRenderer} />
                </Table>,
            );
            table
                .find(`.${Classes.TABLE_QUADRANT_MAIN} .${Classes.TABLE_QUADRANT_SCROLL_CONTAINER}`)
                .simulate("scroll");
            expect(onVisibleCellsChange.callCount).to.be.greaterThan(1);
            const rowIndices: RowIndices = { rowIndexEnd: 2, rowIndexStart: 0 };
            const columnIndices: ColumnIndices = { columnIndexEnd: 0, columnIndexStart: 0 };
            expect(onVisibleCellsChange.lastCall.calledWith(rowIndices, columnIndices)).to.be.true;
        });
    });

    describe("Horizontally scrolling", () => {
        const CONTAINER_WIDTH = 500;
        const CONTAINER_HEIGHT = 500;

        describe("with no rows of data and ghost cells enabled", () => {
            it("isn't disabled when there are actual columns filling width", () => {
                // large values that will force scrolling
                const LARGE_COLUMN_WIDTH = 300;
                const columnWidths = Array(3).fill(LARGE_COLUMN_WIDTH);

                const table = mountTable({ columnWidths });
                const tableContainer = table.find(`.${Classes.TABLE_CONTAINER}`);
                expect(tableContainer.hasClass(Classes.TABLE_NO_HORIZONTAL_SCROLL)).to.be.false;
            });

            it("is disabled when there are ghost cells filling width", () => {
                // small value so no scrolling needed
                const SMALL_COLUMN_WIDTH = 50;
                const columnWidths = Array(3).fill(SMALL_COLUMN_WIDTH);

                const table = mountTable({ columnWidths });
                const tableContainer = table.find(`.${Classes.TABLE_CONTAINER}`);
                expect(tableContainer.hasClass(Classes.TABLE_NO_HORIZONTAL_SCROLL)).to.be.true;
            });
        });

        it("does not render ghost columns when there is horizontal overflow", () => {
            mountTable(
                { defaultColumnWidth: 100, defaultRowHeight: 20, numRows: 2 },
                {
                    height: 200,
                    // 300px leaves just enough space for the 3 columns, but there is 30px taken up by
                    // the row header, which will overflow.
                    width: 300,
                },
            );
            const numGhostCellsInFirstRow = containerElement!.querySelectorAll(
                `.${Classes.TABLE_CELL_GHOST}.${Classes.rowCellIndexClass(0)}`,
            ).length;
            expect(numGhostCellsInFirstRow).to.be.eq(0);
        });

        function mountTable(
            tableProps: Partial<TableProps> = {},
            tableDimensions: { width: number; height: number } = { height: CONTAINER_HEIGHT, width: CONTAINER_WIDTH },
        ) {
            containerElement!.style.width = `${tableDimensions.width}px`;
            containerElement!.style.height = `${tableDimensions.height}px`;

            TableQuadrantStack.defaultProps.throttleScrolling = false;
            return mount(
                <Table numRows={0} enableGhostCells={true} {...tableProps}>
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
                { attachTo: containerElement },
            );
        }
    });

    describe("Vertically scrolling", () => {
        runTestToEnsureScrollingIsEnabled(true);
        runTestToEnsureScrollingIsEnabled(false);

        it("does not render ghost rows when there is vertical overflow", () => {
            // we need _some_ amount of vertical overflow to avoid the code path which disables vertical scroll
            // in the table altogether. 200px leaves just enough space for the rows, but there is 30px taken up by
            // the column header, which will overflow.
            runTestToEnsureGhostCellsAreNotVisible(200);
        });

        it("does not render ghost rows when there is vertical exact fit", () => {
            // 200px for row heights, 30px for row header
            runTestToEnsureGhostCellsAreNotVisible(230);
        });

        function runTestToEnsureGhostCellsAreNotVisible(height: number) {
            mountTable(
                { defaultRowHeight: 20, enableGhostCells: true },
                {
                    height,
                    width: 300,
                },
            );
            const numGhostCellsInFirstColumn = containerElement!.querySelectorAll(
                `.${Classes.TABLE_CELL_GHOST}.${Classes.columnCellIndexClass(0)}`,
            ).length;
            expect(numGhostCellsInFirstColumn).to.be.eq(0);
        }

        function runTestToEnsureScrollingIsEnabled(enableGhostCells: boolean) {
            it(`isn't disabled when there is half a row left to scroll to and enableGhostCells is set to ${enableGhostCells}`, () => {
                const table = mountTable(
                    { defaultRowHeight: 30, enableGhostCells },
                    {
                        height: 320,
                        width: 300,
                    },
                );
                const tableContainer = table.find(`.${Classes.TABLE_CONTAINER}`);
                // There should be 10px left of scrolling. Height is 320, rows take up 300, and headerRow takes up 30
                expect(tableContainer.hasClass(Classes.TABLE_NO_VERTICAL_SCROLL)).to.be.false;
            });
        }

        function mountTable(tableProps: Partial<TableProps> = {}, tableDimensions: { width: number; height: number }) {
            containerElement!.style.width = `${tableDimensions.width}px`;
            containerElement!.style.height = `${tableDimensions.height}px`;

            TableQuadrantStack.defaultProps.throttleScrolling = false;
            return mount(
                <Table numRows={10} {...tableProps}>
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
                { attachTo: containerElement },
            );
        }
    });

    describe("Instance methods", () => {
        describe("resizeRowsByApproximateHeight", () => {
            const STR_LENGTH_SHORT = 10;
            const STR_LENGTH_LONG = 100;
            const NUM_ROWS = 4;

            const cellTextShort = createStringOfLength(STR_LENGTH_SHORT);
            const cellTextLong = createStringOfLength(STR_LENGTH_LONG);

            const getCellText = (rowIndex: number) => {
                return rowIndex === 0 ? cellTextShort : cellTextLong;
            };
            const cellRenderer = (rowIndex: number) => {
                return <Cell wrapText={true}>{getCellText(rowIndex)}</Cell>;
            };

            let table: Table | undefined;
            const saveTable = (t: Table) => (table = t);

            beforeEach(() => {
                harness.mount(
                    <Table ref={saveTable} numRows={NUM_ROWS}>
                        <Column name="Column0" cellRenderer={cellRenderer} />
                        <Column name="Column1" cellRenderer={cellRenderer} />
                    </Table>,
                );
            });

            afterEach(() => {
                table = undefined;
            });

            it("resizes each row to fit its respective tallest cell", () => {
                React.act(() => table!.resizeRowsByApproximateHeight(getCellText));

                expect(table!.state.rowHeights).to.deep.equal([36, 144, 144, 144]);
            });

            it("still uses defaults if an empty `options` object is passed", () => {
                React.act(() => table!.resizeRowsByApproximateHeight(getCellText, {}));

                expect(table!.state.rowHeights).to.deep.equal([36, 144, 144, 144]);
            });

            it("can customize options", () => {
                React.act(() => table!.resizeRowsByApproximateHeight(getCellText, { getNumBufferLines: 2 }));

                expect(table!.state.rowHeights).to.deep.equal([54, 162, 162, 162]);
            });
        });

        describe("resizeRowsByTallestCell", () => {
            it("Gets and sets the tallest cell by columns correctly", () => {
                const DEFAULT_RESIZE_HEIGHT = 20;
                const MAX_HEIGHT = 40;

                const renderCellLong = () => <Cell wrapText={true}>my cell value with lots and lots of words</Cell>;
                const renderCellShort = () => <Cell wrapText={false}>short value</Cell>;

                let table: Table;

                const saveTable = (t: Table) => (table = t);

                harness.mount(
                    <Table ref={saveTable} numRows={4}>
                        <Column name="Column0" cellRenderer={renderCellLong} />
                        <Column name="Column1" cellRenderer={renderCellShort} />
                    </Table>,
                );

                React.act(() => table!.resizeRowsByTallestCell(0));
                expect(table!.state.rowHeights[0], "resizes by first column").to.equal(MAX_HEIGHT);

                React.act(() => table!.resizeRowsByTallestCell(1));
                expect(table!.state.rowHeights[0], "resizes by second column").to.equal(DEFAULT_RESIZE_HEIGHT);

                React.act(() => table!.resizeRowsByTallestCell([0, 1]));
                expect(table!.state.rowHeights[0], "resizes by both column").to.equal(MAX_HEIGHT);

                React.act(() => table!.resizeRowsByTallestCell([1]));
                expect(table!.state.rowHeights[0], "resizes by second column via array").to.equal(
                    DEFAULT_RESIZE_HEIGHT,
                );

                React.act(() => table!.resizeRowsByTallestCell());
                expect(table!.state.rowHeights[0], "resizes by visible columns").to.equal(MAX_HEIGHT);
            });

            it("Works on a frozen column when the corresponding MAIN-quadrant column is out of view", () => {
                const CONTAINER_WIDTH = 500;
                const CONTAINER_HEIGHT = 500;
                const EXPECTED_MAX_ROW_HEIGHT = 20;
                const FROZEN_COLUMN_INDEX = 0;

                const cellRenderer = () => <Cell wrapText={true}>my cell value with lots and lots of words</Cell>;

                // huge values that will force scrolling
                const LARGE_COLUMN_WIDTH = 1000;
                // need 5 columns to ensure the first column won't be included
                // in the 3 "bleed" columns once we scroll rightward.
                const columnWidths = Array(5).fill(LARGE_COLUMN_WIDTH);

                // resize container element to enforce a maximum viewport size
                // small enough to cause scrolling.
                containerElement!.style.width = `${CONTAINER_WIDTH}px`;
                containerElement!.style.height = `${CONTAINER_HEIGHT}px`;

                // need to mount directly into the DOM for this test to work
                const table = mount(
                    <Table numRows={4} numFrozenColumns={1} columnWidths={columnWidths}>
                        <Column name="Column0" cellRenderer={cellRenderer} />
                        <Column name="Column1" cellRenderer={cellRenderer} />
                        <Column name="Column2" cellRenderer={cellRenderer} />
                        <Column name="Column3" cellRenderer={cellRenderer} />
                        <Column name="Column4" cellRenderer={cellRenderer} />
                    </Table>,
                    { attachTo: containerElement },
                );

                // scroll the frozen column out of view in the MAIN quadrant,
                // and expect a non-zero height.
                const tableInstance = table.instance() as Table;
                React.act(() => {
                    tableInstance.scrollToRegion(Regions.column(columnWidths.length - 1));
                    tableInstance.resizeRowsByTallestCell(FROZEN_COLUMN_INDEX);
                });
                expect(table.state().rowHeights[0]).to.equal(EXPECTED_MAX_ROW_HEIGHT);
            });
        });

        describe("scrollToRegion", () => {
            const CONTAINER_WIDTH = 200;
            const CONTAINER_HEIGHT = 200;

            const ROW_HEIGHT = 300;
            const COLUMN_WIDTH = 400;

            const NUM_ROWS = 3;
            const NUM_COLUMNS = 3;

            const TARGET_ROW = 1;
            const TARGET_COLUMN = 2;

            let tableInstance: Table;

            it("should calculate coordinates for scrolling to cell", () => {
                mountTable();
                checkInstanceMethod(
                    Regions.cell(TARGET_ROW, TARGET_COLUMN),
                    TARGET_COLUMN * COLUMN_WIDTH,
                    TARGET_ROW * ROW_HEIGHT,
                );
            });

            it("should calculate coordinates for scrolling to frozen cell", () => {
                mountTable({ numFrozenColumns: TARGET_COLUMN + 1, numFrozenRows: TARGET_ROW + 1 });
                checkInstanceMethod(Regions.cell(TARGET_ROW, TARGET_COLUMN), 0, 0);
            });

            it("should calculate coordinates for scrolling to row", () => {
                mountTable();
                checkInstanceMethod(Regions.row(TARGET_ROW), 0, TARGET_ROW * ROW_HEIGHT);
            });

            it("should calculate coordinates for scrolling to frozen row", () => {
                mountTable({ numFrozenRows: TARGET_ROW + 1 });
                checkInstanceMethod(Regions.row(TARGET_ROW), 0, 0);
            });

            it("should calculate coordinates for scrolling to column", () => {
                mountTable();
                checkInstanceMethod(Regions.column(TARGET_COLUMN), TARGET_COLUMN * COLUMN_WIDTH, 0);
            });

            it("should calculate coordinates for scrolling to frozen column", () => {
                mountTable({ numFrozenColumns: TARGET_COLUMN + 1 });
                checkInstanceMethod(Regions.column(TARGET_COLUMN), 0, 0);
            });

            it("should calculate coordinates for scrolling to full table", () => {
                mountTable();
                checkInstanceMethod(Regions.table(), 0, 0);
            });

            function checkInstanceMethod(region: Region, expectedScrollLeft: number, expectedScrollTop: number) {
                // cast as `any` to access private members
                const spy = sinon.spy((tableInstance as any).quadrantStackInstance, "scrollToPosition");
                tableInstance.scrollToRegion(region);
                // just check that the scroll event would be triggered with the proper args; don't
                // bother checking the result of the whole action
                expect(spy.firstCall.args).to.deep.equal([expectedScrollLeft, expectedScrollTop]);
                spy.restore();
            }

            function saveTable(ref: Table) {
                tableInstance = ref;
            }

            function mountTable(tableProps: Partial<TableProps> = {}) {
                mount(
                    <div style={{ height: CONTAINER_HEIGHT, width: CONTAINER_WIDTH }}>
                        <Table
                            columnWidths={Array(NUM_COLUMNS).fill(COLUMN_WIDTH)}
                            numRows={NUM_ROWS}
                            rowHeights={Array(NUM_ROWS).fill(ROW_HEIGHT)}
                            ref={saveTable}
                            {...tableProps}
                        >
                            <Column cellRenderer={renderDummyCell} />
                            <Column cellRenderer={renderDummyCell} />
                            <Column cellRenderer={renderDummyCell} />
                        </Table>
                    </div>,
                );
            }
        });
    });

    describe("Full-table selection", () => {
        const onFocusedCell = sinon.spy();
        const onSelection = sinon.spy();

        afterEach(() => {
            onFocusedCell.resetHistory();
            onSelection.resetHistory();
        });

        it("Selects all and moves focus cell to (0, 0) on click of upper-left corner", () => {
            const table = mountTable();
            selectFullTable(table);

            expect(onSelection.args[0][0]).to.deep.equal([Regions.table()]);
            expect(onFocusedCell.args[0][0]).to.deep.equal({
                col: 0,
                focusSelectionIndex: 0,
                row: 0,
            });
        });

        it("Does not move focused cell on shift+click", () => {
            const table = mountTable();
            selectFullTable(table, { shiftKey: true });

            expect(onSelection.args[0][0]).to.deep.equal([Regions.table()]);
            expect(onFocusedCell.called).to.be.false;
        });

        it("Selects and deselects column/row headers when selecting and deselecting the full table", () => {
            const table = mountTable();

            // select the full table
            selectFullTable(table);
            let columnHeader = table.find(COLUMN_HEADER_SELECTOR).hostNodes().first();
            let rowHeader = table
                .find(`.${Classes.TABLE_ROW_HEADERS}`)
                .find(`.${Classes.TABLE_HEADER}`)
                .hostNodes()
                .first();
            expect(columnHeader.hasClass(Classes.TABLE_HEADER_SELECTED)).to.be.true;
            expect(rowHeader.hasClass(Classes.TABLE_HEADER_SELECTED)).to.be.true;

            // deselect the full table
            table.setProps({ selectedRegions: [] });
            table.update();
            columnHeader = table.find(COLUMN_HEADER_SELECTOR).hostNodes().first();
            rowHeader = table
                .find(`.${Classes.TABLE_ROW_HEADERS}`)
                .find(`.${Classes.TABLE_HEADER}`)
                .hostNodes()
                .first();
            expect(columnHeader.hasClass(Classes.TABLE_HEADER_SELECTED)).to.be.false;
            expect(rowHeader.hasClass(Classes.TABLE_HEADER_SELECTED)).to.be.false;
        });

        it("Aligns properly with the table borders", () => {
            const table = mountTable();
            selectFullTable(table);

            // we'll pass this to parseInt as the radix argument.
            const BASE_10 = 10;

            // the test framework doesn't necessarily return the expected values
            // via getBoundingClientRect(), so let's just grab the inline
            // width/height styles from the bottom container.
            const bottomContainer = table
                .find(`.${Classes.TABLE_QUADRANT_MAIN}`)
                .find(`.${Classes.TABLE_BOTTOM_CONTAINER}`)
                .hostNodes()
                .getDOMNode<HTMLElement>();
            const { width: expectedWidth, height: expectedHeight } = bottomContainer.style;
            const [expectedWidthAsNumber, expectedHeightAsNumber] = [expectedWidth, expectedHeight].map(n =>
                parseInt(n, BASE_10),
            );

            // use chained .find()'s instead of one long selector just for the
            // sake of reducing line length
            const selectionOverlay = table
                .find(`.${Classes.TABLE_QUADRANT_MAIN}`)
                .find(`.${Classes.TABLE_QUADRANT_BODY_CONTAINER}`)
                .find(`.${Classes.TABLE_SELECTION_REGION}`)
                .hostNodes()
                .getDOMNode<HTMLElement>();
            const { width: actualWidth, height: actualHeight } = selectionOverlay.style;
            const [actualWidthAsNumber, actualHeightAsNumber] = [actualWidth, actualHeight].map(n =>
                parseInt(n, BASE_10),
            );

            // the "actual" selection width should be 1px greater than the
            // "expected' table width, because of a correction necessary for
            // maintaining proper alignment on the bottom/right sides of the
            // selection region (see: styleBodyRegion() in table.tsx).
            expect(actualWidthAsNumber).to.equal(expectedWidthAsNumber + 1);
            expect(actualHeightAsNumber).to.equal(expectedHeightAsNumber + 1);
        });

        function mountTable() {
            return mount(
                <Table enableFocusedCell={true} onFocusedCell={onFocusedCell} onSelection={onSelection} numRows={10}>
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
            );
        }

        function selectFullTable(table: ReactWrapper<any>, ...mouseEventArgs: any[]) {
            const menu = table.find(`.${Classes.TABLE_QUADRANT_MAIN} .${Classes.TABLE_MENU}`);
            menu.simulate("mousedown", ...mouseEventArgs).simulate("mouseup", ...mouseEventArgs);
        }
    });

    describe("Changing selectionModes", () => {
        it("Removes uncontrolled selected region if selectionModes change to make it invalid", () => {
            const table = mount(
                <Table selectionModes={[RegionCardinality.FULL_COLUMNS]}>
                    <Column />
                </Table>,
            );
            React.act(() => {
                table.setState({ selectedRegions: [Regions.column(0)] });
            });
            table.setProps({ selectionModes: [] });
            expect(table.state("selectedRegions")).to.have.lengthOf(0);
        });

        it("Leaves controlled selected region if selectionModes change to make it invalid", () => {
            const table = mount(
                <Table selectionModes={[RegionCardinality.FULL_COLUMNS]} selectedRegions={[Regions.column(0)]}>
                    <Column />
                </Table>,
            );
            table.setProps({ selectionModes: [] });
            expect(table.state("selectedRegions")).to.have.lengthOf(1);
        });
    });

    describe("onCompleteRender", () => {
        it("triggers immediately on mount/update with RenderMode.NONE", () => {
            const onCompleteRenderSpy = sinon.spy();
            const table = mount(
                <Table numRows={100} onCompleteRender={onCompleteRenderSpy} renderMode={RenderMode.NONE}>
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
            );
            expect(onCompleteRenderSpy.callCount, "call count on mount").to.equal(1);
            table.setProps({ numRows: 101 });
            expect(onCompleteRenderSpy.callCount, "call count on update").to.equal(2);
        });

        it("does not try to render cells that no longer exist", () => {
            const onCompleteRenderSpy = sinon.spy();
            let numRows = 2;
            const cellRenderer = (rowIndex: number) => {
                if (rowIndex >= numRows) {
                    throw new Error(`There is no row with index ${rowIndex}`);
                }
                return <Cell>Row ${rowIndex}</Cell>;
            };
            const table = mount(
                <Table numRows={numRows} onCompleteRender={onCompleteRenderSpy} renderMode={RenderMode.NONE}>
                    <Column cellRenderer={cellRenderer} />
                </Table>,
            );
            numRows = 1;
            expect(() => table.setProps({ numRows })).does.not.throw();
        });

        it("triggers immediately on mount with RenderMode.BATCH_ON_UPDATE", () => {
            const onCompleteRenderSpy = sinon.spy();
            mount(
                <Table onCompleteRender={onCompleteRenderSpy} numRows={100} renderMode={RenderMode.BATCH_ON_UPDATE}>
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
            );
            expect(onCompleteRenderSpy.callCount, "call count on mount").to.equal(2);
        });

        it("triggers immediately on mount/update with RenderMode.BATCH for very small batches", () => {
            const onCompleteRenderSpy = sinon.spy();
            const numRows = 1;

            // RenderMode.BATCH is the default
            const table = mount(
                <Table numRows={numRows} onCompleteRender={onCompleteRenderSpy}>
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
            );

            expect(onCompleteRenderSpy.callCount, "call count on mount").to.equal(2);
            table.setProps({ numRows: 2 }); // still small enough to fit in one batch
            expect(onCompleteRenderSpy.callCount, "call count on update").to.equal(3);
        });
    });

    describe("Freezing", () => {
        let consoleWarn: sinon.SinonStub | undefined;

        before(() => (consoleWarn = sinon.stub(console, "warn")));
        afterEach(() => consoleWarn?.resetHistory());
        after(() => consoleWarn?.restore());

        describe("columns validation", () => {
            it("doesn't print a warning with default (0) frozen", () => {
                const table = mount(<Table />);
                expect(table.state("numFrozenColumnsClamped")).to.equal(0, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_COLUMNS_BOUND_WARNING)).to.be.false;
            });

            it("prints a warning and clamps numFrozenColumns with 0 columns, 1 frozen", () => {
                const table = mount(<Table numFrozenColumns={1} />);
                expect(table.state("numFrozenColumnsClamped")).to.equal(0, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_COLUMNS_BOUND_WARNING)).to.be.true;
            });

            it("prints a warning and clamps numFrozenColumns with 1 column, 2 frozen", () => {
                const table = mount(
                    <Table numFrozenColumns={2}>
                        <Column />
                    </Table>,
                );
                expect(table.state("numFrozenColumnsClamped")).to.equal(1, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_COLUMNS_BOUND_WARNING)).to.be.true;
            });
        });

        describe("rows validation", () => {
            it("doesn't print a warning with default (0) frozen", () => {
                const table = mount(<Table />);
                expect(table.state("numFrozenRowsClamped")).to.equal(0, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_ROWS_BOUND_WARNING)).to.be.false;
            });

            it("prints a warning and clamps numFrozenRows with 0 rows, 1 frozen", () => {
                const table = mount(<Table numFrozenRows={1} numRows={0} />);
                expect(table.state("numFrozenRowsClamped")).to.equal(0, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_ROWS_BOUND_WARNING)).to.be.true;
            });

            it("prints a warning and clamps numFrozenRows with 1 row, 2 frozen", () => {
                const table = mount(
                    <Table numFrozenRows={2} numRows={1}>
                        <Column />
                    </Table>,
                );
                expect(table.state("numFrozenRowsClamped")).to.equal(1, "clamped state");
                expect(consoleWarn?.calledWith(Errors.TABLE_NUM_FROZEN_ROWS_BOUND_WARNING)).to.be.true;
            });
        });

        const NUM_ROWS = 4;
        const NUM_COLUMNS = 3;

        // assuming numFrozenColumns=1 and numFrozenRows=1
        const NUM_TOP_LEFT_COLUMNS = 1;
        const NUM_TOP_LEFT_ROWS = 1;
        const NUM_TOP = NUM_COLUMNS - NUM_TOP_LEFT_COLUMNS;
        const NUM_LEFT = NUM_ROWS - NUM_TOP_LEFT_ROWS;
        const NUM_TOP_LEFT = NUM_TOP_LEFT_COLUMNS * NUM_TOP_LEFT_ROWS;

        it("does not render frozen bleed cells if numFrozenRows=0 and numFrozenColumns=0", () => {
            const table = mount(createTableOfSize(NUM_COLUMNS, NUM_ROWS));
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
        });

        it("renders only one row of frozen cells (i.e. no bleed cells) if numFrozenRows = 1", () => {
            const table = mount(createTableOfSize(NUM_COLUMNS, NUM_ROWS, {}, { numFrozenRows: 1 }));
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_COLUMNS);
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
        });

        it("renders only one column of frozen cells (i.e. no bleed cells) if numFrozenColumns = 1", () => {
            const table = mount(createTableOfSize(NUM_COLUMNS, NUM_ROWS, {}, { numFrozenColumns: 1 }));
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_ROWS);
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
        });

        it("renders correct number of frozen cells if numFrozenRows = 1 and numFrozenColumns = 1", () => {
            const table = mount(
                createTableOfSize(NUM_COLUMNS, NUM_ROWS, {}, { numFrozenColumns: 1, numFrozenRows: 1 }),
            );
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_TOP);
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_LEFT);
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.have.lengthOf(
                NUM_TOP_LEFT,
            );
        });

        it("renders correct number of frozen cells if numFrozenRows and numFrozenColumns are changed to > 0", () => {
            const table = mount(createTableOfSize(NUM_COLUMNS, NUM_ROWS));
            table.setProps({ numFrozenColumns: 1, numFrozenRows: 1 });
            table.update();
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_TOP);
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.have.lengthOf(NUM_LEFT);
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.have.lengthOf(
                NUM_TOP_LEFT,
            );
        });

        it("renders correct number of frozen cells if numFrozenRows and numFrozenColumns are changed to 0", () => {
            const table = mount(
                createTableOfSize(NUM_COLUMNS, NUM_ROWS, {}, { numFrozenColumns: 1, numFrozenRows: 1 }),
            );
            table.setProps({ numFrozenColumns: 0, numFrozenRows: 0 });
            table.update();
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
            expect(table.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT} .${Classes.TABLE_CELL}`)).to.be.empty;
        });
    });

    describe("Resizing", () => {
        it("Resizes selected rows together", () => {
            const table = mountTable();
            const rows = getRowHeadersWrapper(table)!;
            const resizeHandleTarget = getResizeHandle(rows, 0)!;

            resizeHandleTarget.mouse("mousemove").mouse("mousedown").mouse("mousemove", 0, 2).mouse("mouseup");

            expect(rows.find(`.${Classes.TABLE_HEADER}`, 0).bounds()!.height).to.equal(3);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 1).bounds()!.height).to.equal(3);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 2).bounds()!.height).to.equal(1);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 3).bounds()!.height).to.equal(1);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 4).bounds()!.height).to.equal(3);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 5).bounds()!.height).to.equal(3);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 6).bounds()!.height).to.equal(3);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 7).bounds()!.height).to.equal(1);
            expect(rows.find(`.${Classes.TABLE_HEADER}`, 8).bounds()!.height).to.equal(3);
        });

        it("Resizes columns when row headers are hidden without throwing an error", () => {
            const table = mountTable({ enableRowHeader: false });
            const columnHeader = table.find(`.${Classes.TABLE_COLUMN_HEADERS}`);
            const resizeHandleTarget = getResizeHandle(columnHeader, 0);

            expect(() => {
                resizeHandleTarget.mouse("mousemove").mouse("mousedown").mouse("mousemove", 0, 2).mouse("mouseup");
            }).not.to.throw();
        });

        it("Hides selected-region styles while resizing", () => {
            const table = mountTable();
            const resizeHandleTarget = getResizeHandle(getRowHeadersWrapper(table)!, 0)!;

            expect(resizeHandleTarget).not.to.be.undefined;
            resizeHandleTarget!.mouse("mousemove").mouse("mousedown").mouse("mousemove", 0, 2);
            expect(table.find(`.${Classes.TABLE_SELECTION_REGION}`).exists()).to.be.false;

            resizeHandleTarget!.mouse("mouseup");
            expect(table.find(`.${Classes.TABLE_SELECTION_REGION}`).exists()).to.be.true;
        });

        it("resizes frozen column on double-click when corresponding MAIN-quadrant column not in view", () => {
            const CONTAINER_WIDTH = 500;
            const CONTAINER_HEIGHT = 500;
            const EXPECTED_COLUMN_WIDTH_WITH_LOCAL_KARMA = 212;
            const EXPECTED_ROW_HEADER_WIDTH = 30;
            const FROZEN_COLUMN_INDEX = 0;

            const cellRenderer = () => <Cell wrapText={false}>my cell value with lots and lots of words</Cell>;

            // huge values that will force scrolling
            const LARGE_COLUMN_WIDTH = 1000;
            // need 5 columns to ensure the first column won't be included
            // in the 3 "bleed" columns once we scroll rightward.
            const columnWidths = Array(5).fill(LARGE_COLUMN_WIDTH);

            // set dimennsions on container element to enforce a maximum viewport size
            // small enough to cause scrolling.
            containerElement!.style.width = `${CONTAINER_WIDTH}px`;
            containerElement!.style.height = `${CONTAINER_HEIGHT}px`;

            // need to mount directly into the DOM for this test to work
            let table: Table | undefined;
            const saveTable = (ref: Table) => (table = ref);
            const tableElement = harness.mount(
                <Table ref={saveTable} numRows={1} numFrozenColumns={1} columnWidths={columnWidths}>
                    <Column name="Column0" cellRenderer={cellRenderer} />
                    <Column name="Column1" cellRenderer={cellRenderer} />
                    <Column name="Column2" cellRenderer={cellRenderer} />
                    <Column name="Column3" cellRenderer={cellRenderer} />
                    <Column name="Column4" cellRenderer={cellRenderer} />
                </Table>,
            );

            // scroll the frozen column out of view in the MAIN quadrant,
            // and expect a non-zero height.
            table!.scrollToRegion(Regions.column(columnWidths.length - 1));

            const quadrantSelector = `.${Classes.TABLE_QUADRANT_LEFT}`;
            const columnHeaderSelector = `${quadrantSelector} .${Classes.TABLE_COLUMN_HEADERS}`;
            const resizeHandleSelector = `${columnHeaderSelector} .${Classes.TABLE_RESIZE_HANDLE_TARGET}`;

            const quadrantElement = tableElement.find(quadrantSelector, 0);
            const frozenColumnResizeHandle = tableElement.find(resizeHandleSelector, FROZEN_COLUMN_INDEX);

            // double-click the frozen column's resize handle
            frozenColumnResizeHandle.mouse("mousedown").mouse("mouseup", 10).mouse("mousedown").mouse("mouseup", 10);

            const columnWidth = table!.state.columnWidths[0];
            const quadrantWidth = parseInt(quadrantElement.style()!.width, 10);
            const expectedQuadrantWidth = EXPECTED_ROW_HEADER_WIDTH + EXPECTED_COLUMN_WIDTH_WITH_LOCAL_KARMA;

            // local `gulp karma` expects 216px, and Circle CI `gulp test`
            // expects 265px. :/ .at.least() seems more reliable than bounding
            // the width in [216,265] and introducing potential test flakiness.
            expect(columnWidth, "column resizes correctly").to.be.at.least(EXPECTED_COLUMN_WIDTH_WITH_LOCAL_KARMA);
            expect(quadrantWidth, "quadrant resizes correctly").to.be.at.least(expectedQuadrantWidth);
        });

        function mountTable(tableProps: Partial<TableProps> = {}) {
            return harness.mount(
                // set the row height so small so they can all fit in the viewport and be rendered
                <Table
                    defaultRowHeight={1}
                    enableRowResizing={true}
                    minRowHeight={1}
                    numRows={10}
                    selectedRegions={[Regions.row(0, 1), Regions.row(4, 6), Regions.row(8)]}
                    {...tableProps}
                >
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                    <Column cellRenderer={renderDummyCell} />
                </Table>,
            );
        }

        function getRowHeadersWrapper(table: ElementHarness) {
            return table.find(`.${Classes.TABLE_ROW_HEADERS}`);
        }

        function getResizeHandle(header: ElementHarness, index: number) {
            return header.find(`.${Classes.TABLE_RESIZE_HANDLE_TARGET}`, index);
        }
    });

    describe("Reordering", () => {
        const OLD_INDEX = 0;
        const NEW_INDEX = 1;
        const LENGTH = 2;
        const NUM_COLUMNS = 5;
        const NUM_ROWS = 5;

        // considerations:
        // - make the rows and columns fit exactly in the table dimensions; not trying to test scrolling.
        // - ensure the columns are wide enough to fit their reorder handle.
        const CONTAINER_WIDTH_IN_PX = 200;
        const CONTAINER_HEIGHT_IN_PX = 200;
        const ROW_HEIGHT_IN_PX = CONTAINER_HEIGHT_IN_PX / NUM_ROWS;
        const COLUMN_WIDTH_IN_PX = CONTAINER_WIDTH_IN_PX / NUM_COLUMNS;

        const OFFSET_X = (NEW_INDEX + LENGTH) * COLUMN_WIDTH_IN_PX;
        const OFFSET_Y = (NEW_INDEX + LENGTH) * ROW_HEIGHT_IN_PX;

        const onColumnsReordered = sinon.spy();
        const onRowsReordered = sinon.spy();
        const onSelection = sinon.spy();

        afterEach(() => {
            onColumnsReordered.resetHistory();
            onRowsReordered.resetHistory();
            onSelection.resetHistory();
        });

        it("Shows preview guide and invokes callback when selected columns reordered", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
                selectedRegions: [Regions.column(OLD_INDEX, LENGTH - 1)],
            });
            const headerCell = getHeaderCell(getColumnHeadersWrapper(table)!, 0)!;
            const reorderHandle = getReorderHandle(headerCell)!;
            reorderHandle.mouse("mousedown").mouse("mousemove", getAdjustedOffsetX(OFFSET_X, reorderHandle));

            const guide = table.find(`.${Classes.TABLE_VERTICAL_GUIDE}`);
            expect(guide).to.exist;

            reorderHandle.mouse("mouseup", getAdjustedOffsetX(OFFSET_X, reorderHandle));
            expect(onColumnsReordered.called).to.be.true;
            expect(onColumnsReordered.calledWith(OLD_INDEX, NEW_INDEX, LENGTH)).to.be.true;
        });

        it("Shows preview guide and invokes callback when selected rows reordered", () => {
            const table = mountTable({
                enableRowReordering: true,
                onRowsReordered,
                selectedRegions: [Regions.row(OLD_INDEX, LENGTH - 1)],
            });
            const headerCell = getHeaderCell(getRowHeadersWrapper(table)!, 0)!;
            headerCell.mouse("mousedown").mouse("mousemove", 0, OFFSET_Y);

            const guide = table.find(`.${Classes.TABLE_HORIZONTAL_GUIDE}`)!;
            expect(guide, "Could not find preview guide").to.exist;

            headerCell.mouse("mouseup", 0, OFFSET_Y);
            expect(onRowsReordered.called, "Reorder callback not called").to.be.true;
            expect(
                onRowsReordered.calledWith(OLD_INDEX, NEW_INDEX, LENGTH),
                "Reorder callback called with unexpected args",
            ).to.be.true;
        });

        it("Reorders an unselected column and selects it afterward", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
                onSelection,
            });
            const headerCell = getHeaderCell(getColumnHeadersWrapper(table)!, 0)!;
            const reorderHandle = getReorderHandle(headerCell)!;
            reorderHandle
                .mouse("mousedown")
                .mouse("mousemove", getAdjustedOffsetX(OFFSET_X, reorderHandle))
                .mouse("mouseup", getAdjustedOffsetX(OFFSET_X, reorderHandle));
            expect(onColumnsReordered.called).to.be.true;
            expect(onSelection.firstCall.calledWith([Regions.column(0)]));
        });

        it("Doesn't work on rows if there is no selected region defined yet", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
            });
            getHeaderCell(getColumnHeadersWrapper(table)!, 0)!
                .mouse("mousedown")
                .mouse("mousemove", OFFSET_X)
                .mouse("mouseup", OFFSET_X);
            expect(onColumnsReordered.called).to.be.false;
        });

        it("Clears all selections except the reordered column after reordering", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
                onSelection,
                selectedRegions: [Regions.column(2)], // some other column
            });
            const headerCell = getHeaderCell(getColumnHeadersWrapper(table)!, 0)!;
            const reorderHandle = getReorderHandle(headerCell)!;

            // now we can reorder the column one spot to the right
            const newIndex = 1;
            const length = 1;
            const offsetX = (newIndex + length) * COLUMN_WIDTH_IN_PX;
            const adjustedOffsetX = getAdjustedOffsetX(offsetX, reorderHandle);
            reorderHandle.mouse("mousedown").mouse("mousemove", adjustedOffsetX).mouse("mouseup", adjustedOffsetX);

            // called once on mousedown (to select column 0), once on mouseup (to move the selection)
            expect(onSelection.callCount).to.equal(2);
            expect(onSelection.getCall(1).args).to.deep.equal([[Regions.column(newIndex)]]);
        });

        it("Deselects a selected row on cmd+click (without reordering)", () => {
            const table = mountTable({
                enableRowReordering: true,
                onRowsReordered,
                onSelection,
                selectedRegions: [Regions.row(OLD_INDEX)],
            });
            const headerCell = getHeaderCell(getRowHeadersWrapper(table)!, 0)!;
            headerCell.mouse("mousedown", { metaKey: true }).mouse("mousemove", 0, OFFSET_Y);

            const guide = table.find(`.${Classes.TABLE_HORIZONTAL_GUIDE}`);
            expect(guide.exists(), "guide not drawn").be.false;

            headerCell.mouse("mouseup", 0, OFFSET_Y);
            expect(onSelection.called, "onSelection called").to.be.true;
            expect(onSelection.calledWith([]), "onSelection called with []").to.be.true;
            expect(onRowsReordered.called, "onRowsReordered not called").to.be.false;
        });

        it("Deselects a selected column on cmd+click (without reordering)", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
                onSelection,
                selectedRegions: [Regions.column(OLD_INDEX)],
            });
            const headerCell = getHeaderCell(getColumnHeadersWrapper(table)!, 0)!;
            headerCell.mouse("mousedown", { metaKey: true }).mouse("mousemove", 0, OFFSET_Y);

            const guide = table.find(`.${Classes.TABLE_VERTICAL_GUIDE}`);
            expect(guide.exists(), "guide not drawn").be.false;

            headerCell.mouse("mouseup", 0, OFFSET_Y);
            expect(onSelection.called, "onSelection called").to.be.true;
            expect(onSelection.calledWith([]), "onSelection called with []").to.be.true;
            expect(onColumnsReordered.called, "onColumnsReordered not called").to.be.false;
        });

        it("Does not deselect a selected column when the reorder handle is cmd+click'd", () => {
            const table = mountTable({
                enableColumnReordering: true,
                onColumnsReordered,
                onSelection,
            });
            const headerCell = getHeaderCell(getColumnHeadersWrapper(table)!, 0)!;
            const reorderHandle = getReorderHandle(headerCell)!;
            reorderHandle
                .mouse("mousedown", { metaKey: true })
                .mouse("mousemove", getAdjustedOffsetX(OFFSET_X, reorderHandle))
                .mouse("mouseup", getAdjustedOffsetX(OFFSET_X, reorderHandle));
            expect(onColumnsReordered.called).to.be.true;
            expect(onSelection.firstCall.calledWith([Regions.column(0)]));
        });

        function mountTable(props: Partial<TableProps>) {
            const table = harness.mount(
                <div style={{ height: CONTAINER_HEIGHT_IN_PX, width: CONTAINER_WIDTH_IN_PX }}>
                    <Table
                        columnWidths={Array(NUM_COLUMNS).fill(COLUMN_WIDTH_IN_PX)}
                        numRows={NUM_ROWS}
                        rowHeights={Array(NUM_ROWS).fill(ROW_HEIGHT_IN_PX)}
                        {...props}
                    >
                        <Column cellRenderer={renderDummyCell} />
                        <Column cellRenderer={renderDummyCell} />
                        <Column cellRenderer={renderDummyCell} />
                        <Column cellRenderer={renderDummyCell} />
                        <Column cellRenderer={renderDummyCell} />
                    </Table>
                </div>,
            );
            return table;
        }

        function getColumnHeadersWrapper(table: ElementHarness) {
            return table.find(`.${Classes.TABLE_COLUMN_HEADERS}`);
        }

        function getRowHeadersWrapper(table: ElementHarness) {
            return table.find(`.${Classes.TABLE_ROW_HEADERS}`);
        }

        function getHeaderCell(headersWrapper: ElementHarness, index: number) {
            return headersWrapper.find(`.${Classes.TABLE_HEADER}`, index);
        }

        function getReorderHandle(header: ElementHarness) {
            return header.find(`.${Classes.TABLE_REORDER_HANDLE_TARGET}`);
        }

        function getAdjustedOffsetX(offsetX: number, reorderHandle: ElementHarness) {
            // adjust the x coordinate to account for the rendered width of the reorder handle
            return offsetX - reorderHandle.bounds()!.width;
        }
    });

    describe("Focused cell", () => {
        let onFocusedCell: sinon.SinonSpy;
        let onVisibleCellsChange: sinon.SinonSpy;

        const NUM_ROWS = 3;
        const NUM_COLS = 3;

        // center the initial focus cell
        const DEFAULT_FOCUSED_CELL_COORDS: FocusedCellCoordinates = { col: 1, focusSelectionIndex: 0, row: 1 };

        // Enzyme appears to render our Table at 60px high x 400px wide. make all rows and columns
        // the same size as the table to force scrolling no matter which direction we move the focus
        // cell.
        const ROW_HEIGHT = 60;
        const COL_WIDTH = 400;

        // make these values arbitrarily bigger than the table bounds
        const OVERSIZED_ROW_HEIGHT = 10000;
        const OVERSIZED_COL_WIDTH = 10000;

        // Avoid clipping focused cell border
        const VERTICAL_SCROLL_CORRECTION = -1;
        const HORIZONTAL_SCROLL_CORRECTION = -1;

        beforeEach(() => {
            onFocusedCell = sinon.spy();
            onVisibleCellsChange = sinon.spy();
        });

        afterEach(() => {
            containerElement?.remove();
        });

        it("removes the focused cell if enableFocusedCell is reset to false", () => {
            const { component } = mountTable();
            const focusCellSelector = `.${Classes.TABLE_FOCUS_REGION}`;
            expect(component.find(focusCellSelector).exists()).to.be.true;
            component.setProps({ enableFocusedCell: false });
            component.update();
            expect(component.find(focusCellSelector).exists()).to.be.false;
        });

        describe("moves a focus cell with arrow keys", () => {
            runFocusCellMoveTest("ArrowUp", { col: 1, focusSelectionIndex: 0, row: 0 });
            runFocusCellMoveTest("ArrowDown", {
                col: 1,
                focusSelectionIndex: 0,
                row: 2,
            });
            runFocusCellMoveTest("ArrowLeft", {
                col: 0,
                focusSelectionIndex: 0,
                row: 1,
            });
            runFocusCellMoveTest("ArrowRight", {
                col: 2,
                focusSelectionIndex: 0,
                row: 1,
            });

            it("doesn't move a focus cell if modifier key is pressed", () => {
                const { component } = mountTable();
                component.simulate("keyDown", createKeyEventConfig(component, "ArrowRight", true));
                expect(onFocusedCell.called).to.be.false;
            });

            function runFocusCellMoveTest(key: string, expectedCoords: FocusedCellCoordinates) {
                it(key, () => {
                    const { component } = mountTable();
                    component.simulate("keyDown", createKeyEventConfig(component, key));
                    expect(onFocusedCell.called).to.be.true;
                    expect(onFocusedCell.getCall(0).args[0]).to.deep.equal(expectedCoords);
                });
            }
        });

        describe("moves a focus cell internally with tab and enter", () => {
            function runFocusCellMoveInternalTest(
                name: string,
                key: string,
                shiftKey: boolean,
                focusCellCoords: FocusedCellCoordinates,
                expectedCoords: FocusedCellCoordinates,
            ) {
                it(name, () => {
                    const selectedRegions: Region[] = [
                        { cols: [0, 1], rows: [0, 1] },
                        { cols: [2, 2], rows: [2, 2] },
                    ];
                    const tableHarness = mount(
                        <Table
                            numRows={5}
                            enableFocusedCell={true}
                            focusedCell={focusCellCoords}
                            onFocusedCell={onFocusedCell}
                            selectedRegions={selectedRegions}
                        >
                            <Column name="Column0" cellRenderer={renderDummyCell} />
                            <Column name="Column1" cellRenderer={renderDummyCell} />
                            <Column name="Column2" cellRenderer={renderDummyCell} />
                            <Column name="Column3" cellRenderer={renderDummyCell} />
                            <Column name="Column4" cellRenderer={renderDummyCell} />
                        </Table>,
                    );
                    tableHarness.simulate("keyDown", createKeyEventConfig(tableHarness, key, shiftKey));
                    expect(onFocusedCell.args[0][0]).to.deep.equal(expectedCoords);
                });
            }
            runFocusCellMoveInternalTest(
                "moves a focus cell on tab",
                "Tab",
                false,
                { col: 0, focusSelectionIndex: 0, row: 0 },
                { col: 1, focusSelectionIndex: 0, row: 0 },
            );
            runFocusCellMoveInternalTest(
                "wraps a focus cell around with tab",
                "Tab",
                false,
                { col: 1, focusSelectionIndex: 0, row: 0 },
                { col: 0, focusSelectionIndex: 0, row: 1 },
            );
            runFocusCellMoveInternalTest(
                "moves a focus cell to next region with tab",
                "Tab",
                false,
                { col: 1, focusSelectionIndex: 0, row: 1 },
                { col: 2, focusSelectionIndex: 1, row: 2 },
            );

            runFocusCellMoveInternalTest(
                "moves a focus cell on enter",
                "Enter",
                false,
                { col: 0, focusSelectionIndex: 0, row: 0 },
                { col: 0, focusSelectionIndex: 0, row: 1 },
            );
            runFocusCellMoveInternalTest(
                "wraps a focus cell around with enter",
                "Enter",
                false,
                { col: 0, focusSelectionIndex: 0, row: 1 },
                { col: 1, focusSelectionIndex: 0, row: 0 },
            );
            runFocusCellMoveInternalTest(
                "moves a focus cell to next region with enter",
                "Enter",
                false,
                { col: 1, focusSelectionIndex: 0, row: 1 },
                { col: 2, focusSelectionIndex: 1, row: 2 },
            );

            runFocusCellMoveInternalTest(
                "moves a focus cell on shift+tab",
                "Tab",
                true,
                { col: 1, focusSelectionIndex: 0, row: 0 },
                { col: 0, focusSelectionIndex: 0, row: 0 },
            );
            runFocusCellMoveInternalTest(
                "wraps a focus cell around with shift+tab",
                "Tab",
                true,
                { col: 0, focusSelectionIndex: 0, row: 1 },
                { col: 1, focusSelectionIndex: 0, row: 0 },
            );
            runFocusCellMoveInternalTest(
                "moves a focus cell to prev region with shift+tab",
                "Tab",
                true,
                { col: 0, focusSelectionIndex: 0, row: 0 },
                { col: 2, focusSelectionIndex: 1, row: 2 },
            );

            runFocusCellMoveInternalTest(
                "moves a focus cell on shift+enter",
                "Enter",
                true,
                { col: 0, focusSelectionIndex: 0, row: 1 },
                { col: 0, focusSelectionIndex: 0, row: 0 },
            );
            runFocusCellMoveInternalTest(
                "wraps a focus cell around with shift+enter",
                "Enter",
                true,
                { col: 1, focusSelectionIndex: 0, row: 0 },
                { col: 0, focusSelectionIndex: 0, row: 1 },
            );
            runFocusCellMoveInternalTest(
                "moves a focus cell to next region with shift+enter",
                "Enter",
                true,
                { col: 0, focusSelectionIndex: 0, row: 0 },
                { col: 2, focusSelectionIndex: 1, row: 2 },
            );
        });

        describe("scrolls viewport to fit focused cell after moving it", () => {
            runFocusCellViewportScrollTest("ArrowUp", "top", 0 + VERTICAL_SCROLL_CORRECTION);
            runFocusCellViewportScrollTest("ArrowDown", "top", ROW_HEIGHT * 2 + VERTICAL_SCROLL_CORRECTION);
            runFocusCellViewportScrollTest("ArrowLeft", "left", 0 + HORIZONTAL_SCROLL_CORRECTION);
            runFocusCellViewportScrollTest("ArrowRight", "left", COL_WIDTH * 2 + HORIZONTAL_SCROLL_CORRECTION);

            it("keeps top edge of oversized focus cell in view when moving left and right", () => {
                // subtract one pixel to avoid clipping the focus cell
                const EXPECTED_TOP_OFFSET = OVERSIZED_ROW_HEIGHT * 1 - 1;

                const { component } = mountTable(OVERSIZED_ROW_HEIGHT, OVERSIZED_COL_WIDTH);
                const keyEventConfig = createKeyEventConfig(component, "ArrowRight");

                // move right twice, expecting the viewport to snap to the top of the oversize
                // focused cell both times

                component.simulate("keyDown", keyEventConfig);
                expect(component.state("viewportRect")!.top).to.equal(EXPECTED_TOP_OFFSET);
                component.simulate("keyDown", keyEventConfig);
                expect(component.state("viewportRect")!.top).to.equal(EXPECTED_TOP_OFFSET);
            });

            it("keeps left edge of oversized focus cell in view when moving up and down", () => {
                // subtract one pixel to avoid clipping the focus cell
                const EXPECTED_LEFT_OFFSET = OVERSIZED_COL_WIDTH * 1 - 1;

                const { component } = mountTable(OVERSIZED_ROW_HEIGHT, OVERSIZED_COL_WIDTH);
                const keyEventConfig = createKeyEventConfig(component, "ArrowDown");

                // move down twice, expecting the viewport to snap to the left of the oversize
                // focused cell both times

                component.simulate("keyDown", keyEventConfig);
                expect(component.state("viewportRect")!.left).to.equal(EXPECTED_LEFT_OFFSET);
                component.simulate("keyDown", keyEventConfig);
                expect(component.state("viewportRect")!.left).to.equal(EXPECTED_LEFT_OFFSET);
            });

            function runFocusCellViewportScrollTest(key: string, attrToCheck: "top" | "left", expectedOffset: number) {
                it(key, () => {
                    const { component } = mountTable();
                    component.simulate("keyDown", createKeyEventConfig(component, key));
                    expect(component.state("viewportRect")![attrToCheck]).to.equal(expectedOffset);
                    expect(onVisibleCellsChange.callCount, "onVisibleCellsChange call count").to.equal(3);

                    const rowIndices: RowIndices = { rowIndexEnd: NUM_ROWS - 1, rowIndexStart: 0 };
                    const columnIndices: ColumnIndices = {
                        columnIndexEnd: NUM_COLS - 1,
                        columnIndexStart: 0,
                    };
                    expect(
                        onVisibleCellsChange.lastCall.calledWith(rowIndices, columnIndices),
                        "onVisibleCellsChange row/col indices",
                    ).to.be.true;
                });
            }
        });

        function mountTable(rowHeight = ROW_HEIGHT, colWidth = COL_WIDTH) {
            containerElement = document.createElement("div");
            // need to `.fill` with some explicit value so that mapping will work, apparently
            const columns = Array(NUM_COLS)
                .fill(undefined)
                .map((_, i) => <Column key={i} cellRenderer={renderDummyCell} />);
            const component = mount(
                <Table
                    columnWidths={Array(NUM_COLS).fill(colWidth)}
                    enableFocusedCell={true}
                    focusedCell={DEFAULT_FOCUSED_CELL_COORDS}
                    onFocusedCell={onFocusedCell}
                    onVisibleCellsChange={onVisibleCellsChange}
                    rowHeights={Array(NUM_ROWS).fill(rowHeight)}
                    numRows={NUM_ROWS}
                >
                    {columns}
                </Table>,
                { attachTo: containerElement },
            );

            return { component, containerElement };
        }
    });

    // HACKHACK: https://github.com/palantir/blueprint/issues/5114
    describe.skip("Manually scrolling while drag-selecting", () => {
        const ACTIVATION_CELL_COORDS: CellCoordinates = { col: 1, row: 1 };

        const NUM_ROWS = 3;
        const NUM_COLS = 3;

        const ROW_HEIGHT = 60;
        const COL_WIDTH = 400;

        let onSelection: sinon.SinonSpy;

        beforeEach(() => {
            onSelection = sinon.spy();
        });

        runTest("up");
        runTest("down");
        runTest("left");
        runTest("right");

        function runTest(direction: "up" | "down" | "left" | "right") {
            // create a new object so that tests don't keep mutating the same object instance.
            const { row, col } = ACTIVATION_CELL_COORDS;
            const nextCellCoords = { col, row };

            if (direction === "up") {
                nextCellCoords.col -= 1;
            } else if (direction === "down") {
                nextCellCoords.col += 1;
            } else if (direction === "left") {
                nextCellCoords.row -= 1;
            } else {
                // if direction === "right"
                nextCellCoords.row += 1;
            }

            it(`should keep the same activation coordinates when manually scrolling ${direction}`, () => {
                assertActivationCellUnaffected(nextCellCoords);
            });
        }

        function assertActivationCellUnaffected(nextCellCoords: CellCoordinates) {
            // setup
            const table = mountTable();
            const { grid, locator } = table.instance() as Table;
            const prevViewportRect = locator!.getViewportRect();

            // get native DOM nodes
            const tableNode = table.getDOMNode();
            const tableBodyNode = tableNode.querySelector(`.${Classes.TABLE_BODY_VIRTUAL_CLIENT}`);

            // trigger a drag-selection starting at the center of the activation cell
            const activationX = COL_WIDTH / 2;
            const activationY = ROW_HEIGHT / 2;
            dispatchMouseEvent(tableBodyNode!, "mousedown", activationX, activationY);

            // scroll the next cell into view
            updateLocatorElements(
                table,
                grid!.getCumulativeWidthBefore(nextCellCoords.col),
                grid!.getCumulativeHeightBefore(nextCellCoords.row),
                prevViewportRect.height,
                prevViewportRect.width,
            );

            // move the mouse a little to trigger a selection update
            dispatchMouseEvent(document, "mousemove", activationX, activationY + 1);

            // verify the selection is still anchored to the activation cell
            // (onSelection will now have been called after the "mousedown" and after the "mousemove")
            const selections = onSelection.getCall(1).args[0];
            const selection = selections[0];

            const selectedCols = selection.cols;
            const selectedRows = selection.rows;

            const expectedCols = sortInterval(ACTIVATION_CELL_COORDS.col, nextCellCoords.col);
            const expectedRows = sortInterval(ACTIVATION_CELL_COORDS.row, nextCellCoords.row);

            expect(CoreUtils.arraysEqual(selectedCols, expectedCols)).to.be.true;
            expect(CoreUtils.arraysEqual(selectedRows, expectedRows)).to.be.true;
        }

        function mountTable(rowHeight = ROW_HEIGHT, colWidth = COL_WIDTH) {
            // need to explicitly `.fill` a new array with empty values for mapping to work
            const defineColumn = (_unused: any, i: number) => <Column key={i} cellRenderer={renderDummyCell} />;
            const columns = Array(NUM_COLS).fill(undefined).map(defineColumn);

            const table = mount(
                <Table
                    columnWidths={Array(NUM_COLS).fill(colWidth)}
                    onSelection={onSelection}
                    rowHeights={Array(NUM_ROWS).fill(rowHeight)}
                    numRows={NUM_ROWS}
                >
                    {columns}
                </Table>,
            );

            // scroll to the activation cell
            updateLocatorElements(
                table,
                ACTIVATION_CELL_COORDS.col * colWidth,
                ACTIVATION_CELL_COORDS.row * rowHeight,
                colWidth,
                rowHeight,
            );

            return table;
        }

        function sortInterval(coord1: number, coord2: number) {
            return coord1 > coord2 ? [coord2, coord1] : [coord1, coord2];
        }
    });

    // HACKHACK: https://github.com/palantir/blueprint/issues/5114
    // These tests were not running their assertions correctly for a while, and when that was fixed, the tests broke.
    // Skipping for now so that the rest of the suite can run without error.
    describe.skip("Autoscrolling when rows/columns decrease in count or size", () => {
        const COL_WIDTH = 400;
        const ROW_HEIGHT = 60;

        const NUM_COLS = 10;
        const NUM_ROWS = 10;

        const UPDATED_NUM_COLS = NUM_COLS - 1;
        const UPDATED_NUM_ROWS = NUM_ROWS - 1;

        // small, 1px tweaks that keep the entire table larger than the viewport but that also
        // require autoscrolling
        const UPDATED_COL_WIDTH = COL_WIDTH - 1;
        const UPDATED_ROW_HEIGHT = ROW_HEIGHT - 1;

        let onVisibleCellsChange: sinon.SinonSpy;

        beforeEach(() => {
            onVisibleCellsChange = sinon.spy();
        });

        it("when column count decreases", done => {
            const table = mountTable(NUM_COLS, 1);
            scrollTable(table, (NUM_COLS - 1) * COL_WIDTH, 0, () => {
                const newColumns = renderColumns(UPDATED_NUM_COLS);
                table.setProps({ children: newColumns, columnWidths: Array(UPDATED_NUM_COLS).fill(COL_WIDTH) });

                // the viewport should have auto-scrolled to fit the last column in view
                const viewportRect = table.state("viewportRect")!;
                expect(viewportRect.left).to.equal(UPDATED_NUM_COLS * COL_WIDTH - viewportRect.width);

                // this callback is invoked more than necessary in response to a single change.
                // feel free to tighten the screws and reduce this expected count.
                expect(onVisibleCellsChange.callCount).to.equal(5);
                done();
            });
        });

        it("when row count decreases", done => {
            const table = mountTable(1, NUM_ROWS);
            scrollTable(table, 0, (NUM_ROWS - 1) * ROW_HEIGHT, () => {
                table.setProps({ numRows: UPDATED_NUM_ROWS, rowHeights: Array(UPDATED_NUM_ROWS).fill(ROW_HEIGHT) });

                const viewportRect = table.state("viewportRect")!;
                expect(viewportRect.top).to.equal(UPDATED_NUM_ROWS * ROW_HEIGHT - viewportRect.height);
                expect(onVisibleCellsChange.callCount).to.equal(5);
                done();
            });
        });

        it("when column widths decrease", done => {
            const table = mountTable(NUM_COLS, 1);
            scrollTable(table, (NUM_COLS - 1) * COL_WIDTH, 0, () => {
                table.setProps({ columnWidths: Array(NUM_COLS).fill(UPDATED_COL_WIDTH) });

                const viewportRect = table.state("viewportRect")!;
                expect(viewportRect.left).to.equal(NUM_COLS * UPDATED_COL_WIDTH - viewportRect.width);
                expect(onVisibleCellsChange.callCount).to.equal(5);
                done();
            });
        });

        it("when row heights decrease", done => {
            const table = mountTable(1, NUM_ROWS);
            scrollTable(table, 0, (NUM_ROWS - 1) * ROW_HEIGHT, () => {
                table.setProps({ rowHeights: Array(NUM_ROWS).fill(UPDATED_ROW_HEIGHT) });

                const viewportRect = table.state("viewportRect")!;
                expect(viewportRect.top).to.equal(NUM_ROWS * UPDATED_ROW_HEIGHT - viewportRect.height);
                expect(onVisibleCellsChange.callCount).to.equal(5);
                done();
            });
        });

        function mountTable(numCols: number, numRows: number) {
            return mount(
                <Table
                    columnWidths={Array(numCols).fill(COL_WIDTH)}
                    rowHeights={Array(numRows).fill(ROW_HEIGHT)}
                    numRows={numRows}
                    onVisibleCellsChange={onVisibleCellsChange}
                >
                    {renderColumns(numCols)}
                </Table>,
            );
        }

        function renderColumns(numCols: number) {
            return Array(numCols).fill(undefined).map(renderColumn);
        }

        function renderColumn(_unused: any, i: number) {
            return <Column key={i} cellRenderer={renderDummyCell} />;
        }

        function scrollTable(table: ReactWrapper<any>, scrollLeft: number, scrollTop: number, callback: () => void) {
            // make the viewport small enough to fit only one cell
            updateLocatorElements(table, scrollLeft, scrollTop, COL_WIDTH, ROW_HEIGHT);
            React.act(() => table.find(TableQuadrant).first().simulate("scroll"));

            callback();
        }
    });

    describe("Validation", () => {
        describe("on mount", () => {
            describe("errors", () => {
                // const DEFAULT_NUM_ROWS = 3;
                // const DEFAULT_NUM_COLS = 3;

                // const consoleErrorSpy = sinon.spy(console, "error");

                // function mountTable(props?: Partial<TableProps>, rowHeight = 60, colWidth = 400) {
                //     // need to explicitly `.fill` a new array with empty values for mapping to work
                //     const defineColumn = (_unused: any, i: number) => <Column key={i} cellRenderer={renderDummyCell} />;
                //     const columns = Array(DEFAULT_NUM_COLS).fill(undefined).map(defineColumn);

                //     return mount(
                //         <Table
                //             columnWidths={Array(DEFAULT_NUM_COLS).fill(colWidth)}
                //             rowHeights={Array(DEFAULT_NUM_ROWS).fill(rowHeight)}
                //             numRows={DEFAULT_NUM_ROWS}
                //             {...props}
                //         >
                //             {columns}
                //         </Table>,
                //     );
                // }

                // beforeEach(() => {
                //     consoleErrorSpy.resetHistory();
                // });

                // `expectPropValidationError` incorrectly infers the prop type from the constructor,
                // which includes the default prop keys... so we need to cast to the more partial props type
                const TableClass = Table as React.ComponentClass<TableProps>;

                it("throws an error if numRows < 0", () => {
                    expectPropValidationError(TableClass, { numRows: -1 }, Errors.TABLE_NUM_ROWS_NEGATIVE);
                    // mountTable({ numRows: -1 });
                    // expect(consoleErrorSpy.calledWith(Errors.TABLE_NUM_ROWS_NEGATIVE));
                });

                it("throws an error if numFrozenRows < 0", () => {
                    expectPropValidationError(TableClass, { numFrozenRows: -1 }, Errors.TABLE_NUM_FROZEN_ROWS_NEGATIVE);
                });

                it("throws an error if numFrozenColumns < 0", () => {
                    expectPropValidationError(
                        TableClass,
                        { numFrozenColumns: -1 },
                        Errors.TABLE_NUM_FROZEN_COLUMNS_NEGATIVE,
                    );
                });

                it("throws an error if rowHeights.length !== numRows", () => {
                    expectPropValidationError(
                        TableClass,
                        { numRows: 3, rowHeights: [1, 2] },
                        Errors.TABLE_NUM_ROWS_ROW_HEIGHTS_MISMATCH,
                    );
                });

                it("throws an error if columnWidths.length !== number of <Column>s", () => {
                    expectPropValidationError(
                        TableClass,
                        {
                            children: [<Column key={0} />, <Column key={1} />, <Column key={2} />],
                            columnWidths: [1, 2],
                        },
                        Errors.TABLE_NUM_COLUMNS_COLUMN_WIDTHS_MISMATCH,
                    );
                });

                it("throws an error if a non-<Column> child is provided", () => {
                    // we were printing a warning before, but the Table would
                    // eventually throw an error from deep inside, so might as
                    // well just throw a clear error at the outset.
                    expectPropValidationError(
                        TableClass,
                        {
                            children: <span>I'm a span, not a column</span>,
                        },
                        Errors.TABLE_NON_COLUMN_CHILDREN_WARNING,
                    );
                });
            });

            describe("warnings", () => {
                let consoleWarn: sinon.SinonStub;
                before(() => (consoleWarn = sinon.stub(console, "warn")));
                afterEach(() => consoleWarn.resetHistory());
                after(() => consoleWarn.restore());

                it("should print a warning when numFrozenRows > numRows", () => {
                    mount(<Table numRows={1} numFrozenRows={2} />);
                    expect(consoleWarn.calledOnce);
                    expect(consoleWarn.firstCall.args).to.deep.equal([Errors.TABLE_NUM_FROZEN_ROWS_BOUND_WARNING]);
                });

                it("should print a warning when numFrozenColumns > num <Column>s", () => {
                    mount(
                        <Table numFrozenColumns={2}>
                            <Column />
                        </Table>,
                    );
                    expect(consoleWarn.calledOnce);
                    expect(consoleWarn.firstCall.args).to.deep.equal([Errors.TABLE_NUM_FROZEN_COLUMNS_BOUND_WARNING]);
                });
            });
        });
    });

    // HACKHACK: https://github.com/palantir/blueprint/issues/5114
    it.skip("Accepts a sparse array of column widths", () => {
        const table = harness.mount(
            <Table columnWidths={[null, 200, null]} defaultColumnWidth={75}>
                <Column />
                <Column />
                <Column />
            </Table>,
        );

        const columns = table.find(`.${Classes.TABLE_COLUMN_HEADERS}`);
        expect(columns.find(`.${Classes.TABLE_HEADER}`, 0).bounds()!.width).to.equal(75);
        expect(columns.find(`.${Classes.TABLE_HEADER}`, 1).bounds()!.width).to.equal(200);
        expect(columns.find(`.${Classes.TABLE_HEADER}`, 2).bounds()!.width).to.equal(75);
    });

    // HACKHACK: https://github.com/palantir/blueprint/issues/5114
    describe.skip("Persists column widths", () => {
        const expectHeaderWidth = (table: ElementHarness, index: number, width: number) => {
            expect(
                table.find(`.${Classes.TABLE_COLUMN_HEADERS}`).find(`.${Classes.TABLE_HEADER}`, index).bounds()!.width,
            ).to.equal(width);
        };

        it("remembers width for columns that have an ID", () => {
            const columns = [<Column key="a" id="a" />, <Column key="b" id="b" />, <Column key="c" id="c" />];

            // default and explicit sizes sizes
            const table0 = harness.mount(
                <Table columnWidths={[null, 100, null]} defaultColumnWidth={50}>
                    {columns}
                </Table>,
            );
            expectHeaderWidth(table0, 0, 50);
            expectHeaderWidth(table0, 1, 100);
            expectHeaderWidth(table0, 2, 50);

            // removing explicit size props
            const table1 = harness.mount(<Table>{columns}</Table>);
            expectHeaderWidth(table1, 0, 50);
            expectHeaderWidth(table1, 1, 100);
            expectHeaderWidth(table1, 2, 50);

            // re-arranging and REMOVING columns
            const table = harness.mount(<Table>{[columns[1], columns[0]]}</Table>);
            expectHeaderWidth(table, 0, 100);
            expectHeaderWidth(table, 1, 50);

            // re-arranging and ADDING columns
            const table3 = harness.mount(<Table defaultColumnWidth={51}>{columns}</Table>);
            expectHeaderWidth(table3, 0, 50);
            expectHeaderWidth(table3, 1, 100);
            expectHeaderWidth(table3, 2, 51);
        });

        it("remembers width for columns without IDs using index", () => {
            const columns = [<Column key="a" id="a" />, <Column key="b" />, <Column key="c" />];

            // default and explicit sizes sizes
            const table0 = harness.mount(
                <Table columnWidths={[null, 100, null]} defaultColumnWidth={50}>
                    {columns}
                </Table>,
            );
            expectHeaderWidth(table0, 0, 50);
            expectHeaderWidth(table0, 1, 100);
            expectHeaderWidth(table0, 2, 50);

            // removing explicit size props
            const table1 = harness.mount(<Table>{columns}</Table>);
            expectHeaderWidth(table1, 0, 50);
            expectHeaderWidth(table1, 1, 100);
            expectHeaderWidth(table1, 2, 50);

            // re-arranging and REMOVING columns
            const table = harness.mount(<Table>{[columns[1], columns[0]]}</Table>);
            expectHeaderWidth(table, 0, 50); // <= difference when no IDs
            expectHeaderWidth(table, 1, 50);

            // re-arranging and ADDING columns
            const table3 = harness.mount(<Table defaultColumnWidth={51}>{columns}</Table>);
            expectHeaderWidth(table3, 0, 50);
            expectHeaderWidth(table3, 1, 50); // <= difference when no IDs
            expectHeaderWidth(table3, 2, 51);
        });
    });

    describe("Empty-state", () => {
        const CELL_INDEX = 0;
        const SELECTED_REGIONS = [Regions.row(0), Regions.column(0), Regions.cell(0, 0), Regions.table()];

        let table: ReactWrapper<TableProps, TableState>;

        describe("disables all selection modes", () => {
            it("when numRows = 0", () => {
                table = mountTable(0, 1);
                clickColumnHeaderCell();
                expectNoSelectedRegions();
                clickTableMenu();
                expectNoSelectedRegions();
            });

            it("when numCols = 0", () => {
                table = mountTable(1, 0);
                clickRowHeaderCell();
                expectNoSelectedRegions();
                clickTableMenu();
                expectNoSelectedRegions();
            });
        });

        describe("clears all uncontrolled selections", () => {
            it("when numRows becomes 0", () => {
                table = mountTable(1, 1);
                React.act(() => {
                    table.setState({ selectedRegions: SELECTED_REGIONS });
                });
                table.setProps({ numRows: 0 });
                expectNoSelectedRegions();
            });

            it("when numCols becomes 0", () => {
                table = mountTable(1, 1);
                React.act(() => {
                    table.setState({ selectedRegions: SELECTED_REGIONS });
                });
                table.setProps({ children: [] });
                expectNoSelectedRegions();
            });
        });

        describe("leaves controlled selections in place", () => {
            it("when numRows becomes 0", () => {
                table = mountTable(1, 1, { selectedRegions: SELECTED_REGIONS });
                table.setProps({ numRows: 0, selectedRegions: SELECTED_REGIONS });
                expect(table.state().selectedRegions).to.deep.equal(SELECTED_REGIONS);
            });

            it("when numCols becomes 0", () => {
                table = mountTable(1, 1, { selectedRegions: SELECTED_REGIONS });
                table.setProps({ children: [], selectedRegions: SELECTED_REGIONS });
                expect(table.state().selectedRegions).to.deep.equal(SELECTED_REGIONS);
            });
        });

        function mountTable(numRows: number, numCols: number, tableProps: Partial<TableProps> = {}) {
            // this createTableOfSize API is backwards from the codebase's
            // normal [row, column] parameter order. :/
            return mount(
                createTableOfSize(numCols, numRows, {
                    cellRenderer: renderDummyCell,
                    enableGhostCells: true,
                    enableRowHeader: true,
                    ...tableProps,
                }),
            );
        }

        function click(component: ReactWrapper<any, any>) {
            component.simulate("mousedown").simulate("mouseup");
        }

        function find(selector: string) {
            return table.find(`.${Classes.TABLE_QUADRANT_MAIN} ${selector}`);
        }

        function clickRowHeaderCell() {
            click(find(`.${Classes.TABLE_ROW_HEADERS} .${Classes.TABLE_HEADER}`).at(CELL_INDEX));
        }

        function clickColumnHeaderCell() {
            click(find(`.${Classes.TABLE_COLUMN_HEADERS} .${Classes.TABLE_HEADER}`).at(CELL_INDEX));
        }

        function clickTableMenu() {
            click(find(`.${Classes.TABLE_MENU}`));
        }

        function expectNoSelectedRegions() {
            expect(table.state("selectedRegions")).to.be.empty;
        }
    });

    // HACKHACK: https://github.com/palantir/blueprint/issues/6107
    describe.skip("Hotkey: shift + arrow keys", () => {
        const NUM_ROWS = 3;
        const NUM_COLS = 3;

        const SELECTED_CELL_ROW = 1;
        const SELECTED_CELL_COL = 1;
        const selectedRegions = [Regions.cell(SELECTED_CELL_ROW, SELECTED_CELL_COL)];

        it("resizes a selection on shift + arrow keys", () => {
            const onSelection = sinon.spy();
            const component = mount(createTableOfSize(NUM_COLS, NUM_ROWS, {}, { onSelection, selectedRegions }), {
                attachTo: containerElement,
            });
            const tableContainerEl = component.find(`.${Classes.TABLE_CONTAINER}`).getDOMNode();

            TestUtils.Simulate.keyDown(tableContainerEl, { key: "ArrowRight", shiftKey: true });
            expect(onSelection.callCount).to.equal(1, "should expand rightward");
            expect(onSelection.firstCall.args).to.deep.equal([
                [Regions.cell(SELECTED_CELL_ROW, SELECTED_CELL_COL, SELECTED_CELL_ROW, SELECTED_CELL_COL + 1)],
            ]);
        });

        it("resizes a selection on shift + arrow keys if focusedCell is defined", () => {
            const onSelection = sinon.spy();
            const focusedCell = {
                col: SELECTED_CELL_COL,
                focusSelectionIndex: 0,
                row: SELECTED_CELL_ROW,
            };
            const tableProps = {
                enableFocusedCell: true,
                focusedCell,
                onSelection,
                selectedRegions,
            };
            const component = mount(createTableOfSize(NUM_COLS, NUM_ROWS, {}, tableProps), {
                attachTo: containerElement,
            });
            const tableContainerEl = component.find(`.${Classes.TABLE_CONTAINER}`).getDOMNode();

            const expectedSelectedRegions = [
                Regions.cell(SELECTED_CELL_ROW, SELECTED_CELL_COL, SELECTED_CELL_ROW, SELECTED_CELL_COL + 1),
            ];

            // should expand rightward
            TestUtils.Simulate.keyDown(tableContainerEl, { key: "ArrowRight", shiftKey: true });
            expect(onSelection.callCount).to.equal(1, "should expand rightward");
            expect(onSelection.firstCall.args).to.deep.equal([expectedSelectedRegions]);
            onSelection.resetHistory();

            // pretend the selection change persisted
            component.setProps({ selectedRegions: expectedSelectedRegions });

            // should undo the expansion
            TestUtils.Simulate.keyDown(tableContainerEl, { key: "ArrowLeft", shiftKey: true });
            expect(onSelection.callCount).to.equal(1, "should contract selection leftward");
            expect(onSelection.firstCall.args).to.deep.equal([selectedRegions]);
        });

        it("does not change a selection on shift + arrow keys if enableMultipleSelection=false", () => {
            const onSelection = sinon.spy();
            const tableProps = { enableMultipleSelection: false, onSelection, selectedRegions };
            const component = mount(createTableOfSize(NUM_COLS, NUM_ROWS, {}, tableProps), {
                attachTo: containerElement,
            });
            const tableContainerEl = component.find(`.${Classes.TABLE_CONTAINER}`).getDOMNode();

            TestUtils.Simulate.keyDown(tableContainerEl, { key: "ArrowRight", shiftKey: true });
            expect(onSelection.callCount).to.equal(0, "should not change selection");
        });
    });

    describe("EXPERIMENTAL: cellRendererDependencies", () => {
        it("Does not re-render cells when dependencies don't change", () => {
            const dependencies: any[] = ["stable"];
            const cellRenderer = sinon.stub().returns(<Cell>foo</Cell>);
            const table = mount(
                <Table numRows={1} cellRendererDependencies={dependencies}>
                    <Column name="Column0" cellRenderer={cellRenderer} />
                </Table>,
            );
            const originalCallCount = cellRenderer.callCount;

            // replace the single dependency with a shallow-equal value
            dependencies[0] = "stable";
            table.setProps({ cellRendererDependencies: dependencies });

            expect(cellRenderer.callCount).to.be.equal(
                originalCallCount,
                "cellRenderer should not have been called again when cellRendererDependencies are the same",
            );
        });

        it("Does re-render cells when dependencies change", () => {
            const dependencies: string[] = ["some data from external store"];
            const cellRenderer = () => <Cell>{dependencies[0]}</Cell>;
            const table = mount(
                <Table numRows={1} cellRendererDependencies={dependencies.slice()}>
                    <Column name="Column0" cellRenderer={cellRenderer} />
                </Table>,
            );
            expect(getFirstCellText()).to.equal(dependencies[0]);

            // replace the single dependency with a shallow-equal value
            dependencies[0] = "new data from external store";
            table.setProps({ cellRendererDependencies: dependencies.slice() });
            expect(getFirstCellText()).to.equal(
                dependencies[0],
                "cellRenderer should have been called again when cellRendererDependencies changed",
            );

            function getFirstCellText() {
                return table
                    .find(`.${Classes.rowCellIndexClass(0)}.${Classes.columnCellIndexClass(0)}`)
                    .hostNodes()
                    .text();
            }
        });
    });

    function renderDummyCell() {
        return <Cell>gg</Cell>;
    }

    function updateLocatorElements(
        table: ReactWrapper<any>,
        scrollLeft: number,
        scrollTop: number,
        clientWidth: number,
        clientHeight: number,
    ) {
        const locator = (table.instance() as any).locator;
        const baseStyles = { clientHeight, clientWidth };

        locator.scrollContainerElement = {
            ...baseStyles,
            getBoundingClientRect: () => ({ left: 0, top: 0 }),
            scrollLeft,
            scrollTop,
        };

        const rowHeadersElement = table.getDOMNode().querySelector<HTMLElement>(`.${Classes.TABLE_ROW_HEADERS}`);
        const rowHeaderWidth = rowHeadersElement == null ? 0 : parseInt(rowHeadersElement.style.width, 10);

        // the scrollContainerElement *contains* the cellContainerElement, so
        // when we scroll the former, the latter's bounding rect offsets change
        // commensurately.
        locator.cellContainerElement = {
            ...baseStyles,
            getBoundingClientRect: () => ({
                left: rowHeaderWidth - scrollLeft,
                top: 0 - scrollTop,
            }),
        };
    }

    function createKeyEventConfig(wrapper: ReactWrapper<any, any>, key: string, shiftKey = false) {
        const eventConfig = {
            key,
            preventDefault: () => {
                /* Empty */
            },
            shiftKey,
            stopPropagation: () => {
                /* Empty */
            },
            target: wrapper.instance(),
        };
        return {
            eventConfig,
            nativeEvent: eventConfig,
        };
    }
});
