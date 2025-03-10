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

/* eslint-disable max-classes-per-file, react/jsx-no-bind */

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { Button, Classes, H4, Intent, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import {
    Cell,
    Column,
    ColumnHeaderCell,
    type ColumnHeaderCellProps,
    CopyCellsMenuItem,
    EditableCell,
    EditableName,
    JSONFormat,
    type MenuContext,
    type Region,
    RegionCardinality,
    Regions,
    RowHeaderCell,
    SelectionModes,
    Table2,
    Utils,
} from "@blueprintjs/table";

import { Nav } from "./nav";
const navRoot = ReactDOM.createRoot(document.getElementById("nav"));
navRoot.render(<Nav selected="features" />);

function getTableComponent(numCols: number, numRows: number, columnProps?: any, tableProps?: any) {
    // combine table overrides
    const getCellClipboardData = (row: number, col: number) => {
        return Utils.toBase26Alpha(col) + (row + 1);
    };

    const tablePropsWithDefaults = {
        enableFocusedCell: true,
        getCellClipboardData,
        numRows,
        ...tableProps,
    };

    // combine column overrides
    const columnPropsWithDefaults = {
        cellRenderer: (rowIndex: number, columnIndex: number) => {
            return <Cell>{Utils.toBase26Alpha(columnIndex) + (rowIndex + 1)}</Cell>;
        },
        ...columnProps,
    };
    const columns = Utils.times(numCols, index => {
        return <Column key={index} {...columnPropsWithDefaults} />;
    });
    return <Table2 {...tablePropsWithDefaults}>{columns}</Table2>;
}

const renderTestMenu = () => (
    /* eslint-disable no-console */
    <Menu>
        <MenuItem icon="export" onClick={() => console.log("Beam me up!")} text="Teleport" />
        <MenuItem icon="sort-alphabetical-desc" onClick={() => console.log("ZA is the worst")} text="Down with ZA!" />
        <MenuDivider />
        <MenuItem icon="curved-range-chart" onClick={() => console.log("You clicked the trident!")} text="Psi" />
    </Menu>
);

const table0Root = ReactDOM.createRoot(document.getElementById("table-0"));
table0Root.render(getTableComponent(3, 7));

class FormatsTable extends React.Component {
    private static ROWS = 1000;

    private objects = Utils.times(FormatsTable.ROWS, (row: number) => {
        switch (row) {
            case 1:
                return "string";
            case 2:
                return 3.14;
            case 5:
                return undefined;
            case 6:
                return null;
            case 8:
                return "this is a very long string";
        }
        const obj: { [key: string]: string } = {};
        for (let i = 0; i < 1000; i++) {
            obj[`KEY-${(Math.random() * 10000).toFixed(2)}`] = (Math.random() * 10000).toFixed(2);
        }
        return obj;
    });

    private strings = Utils.times(FormatsTable.ROWS, () => "ABC " + Math.random() * 10000);

    private formatsTable: Table2;

    public render() {
        const saveTable = (table: Table2) => {
            this.formatsTable = table;
        };

        return (
            <Table2 ref={saveTable} numRows={FormatsTable.ROWS} enableRowResizing={true}>
                <Column name="Default" cellRenderer={this.renderDefaultCell} />
                <Column name="Wrapped Text" cellRenderer={this.renderDefaultCellWrapped} />
                <Column name="JSON" cellRenderer={this.renderJSONCell} />
                <Column name="JSON wrapped text" cellRenderer={this.renderJSONCellWrappedText} />
                <Column name="JSON wrapped cell" cellRenderer={this.renderJSONWrappedCell} />
            </Table2>
        );
    }

    public componentDidMount() {
        document.querySelector(".resize-default").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell(0);
        });
        document.querySelector(".resize-wrapped").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell(1);
        });
        document.querySelector(".resize-json").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell(2);
        });
        document.querySelector(".resize-json-wrapped").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell(3);
        });
        document.querySelector(".resize-wrapped-and-json").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell([1, 3]);
        });
        document.querySelector(".resize-viewport").addEventListener("click", () => {
            this.formatsTable.resizeRowsByTallestCell();
        });
    }

    private renderDefaultCell = (row: number) => <Cell>{this.strings[row]}</Cell>;

    private renderDefaultCellWrapped = (row: number) => <Cell wrapText={true}>{this.strings[row]}</Cell>;

    private renderJSONCell = (row: number) => (
        <Cell>
            <JSONFormat preformatted={true}>{this.objects[row]}</JSONFormat>
        </Cell>
    );

    private renderJSONCellWrappedText = (row: number) => (
        <Cell wrapText={true}>
            <JSONFormat preformatted={true}>{this.objects[row]}</JSONFormat>
        </Cell>
    );

    private renderJSONWrappedCell = (row: number) => (
        <Cell>
            <JSONFormat preformatted={false}>{this.objects[row]}</JSONFormat>
        </Cell>
    );
}

const formatsTableRoot = ReactDOM.createRoot(document.getElementById("table-formats"));
formatsTableRoot.render(<FormatsTable />);

interface EditableTableState {
    intents: Intent[];
    names: string[];
    sparseCellData: { [key: string]: string };
    sparseCellIntent: { [key: string]: Intent };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class EditableTable extends React.Component<{}, EditableTableState> {
    public static dataKey = (rowIndex: number, columnIndex: number) => {
        return `${rowIndex}-${columnIndex}`;
    };

    public state: EditableTableState = {
        intents: [],
        names: ["Please", "Rename", "Me"],
        sparseCellData: {},
        sparseCellIntent: {},
    };

    public render() {
        const columns = this.state.names.map((_, index) => (
            <Column key={index} cellRenderer={this.renderCell} columnHeaderCellRenderer={this.renderColumnHeader} />
        ));
        return (
            <Table2
                numRows={7}
                selectionModes={SelectionModes.COLUMNS_AND_CELLS}
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                enableFocusedCell={true}
                enableColumnInteractionBar={true}
            >
                {columns}
            </Table2>
        );
    }

    public renderCell = (rowIndex: number, columnIndex: number) => {
        const dataKey = EditableTable.dataKey(rowIndex, columnIndex);
        const value = this.state.sparseCellData[dataKey];
        return (
            <EditableCell
                value={value == null ? "" : value}
                intent={this.state.sparseCellIntent[dataKey]}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                onCancel={this.cellValidator}
                onChange={this.cellValidator}
                onConfirm={this.cellSetter}
            />
        );
    };

    public renderColumnHeader = (columnIndex: number) => {
        const nameRenderer = (name: string) => {
            return (
                <EditableName
                    name={name}
                    index={columnIndex}
                    intent={this.state.intents[columnIndex]}
                    onChange={this.nameValidator}
                    onCancel={this.nameValidator}
                    onConfirm={this.nameSetter}
                />
            );
        };
        return (
            <ColumnHeaderCell
                menuRenderer={renderTestMenu}
                name={this.state.names[columnIndex]}
                nameRenderer={nameRenderer}
            />
        );
    };

    private isValidValue(value: string) {
        return /^[a-zA-Z]*$/.test(value);
    }

    private nameValidator = (name: string, index: number) => {
        const intent = this.isValidValue(name) ? null : Intent.DANGER;
        this.setArrayState("intents", index, intent);
        this.setArrayState("names", index, name);
    };

    private nameSetter = (name: string, index: number) => {
        this.setArrayState("names", index, name);
    };

    private cellValidator = (value: string, rowIndex: number, columnIndex: number) => {
        const dataKey = EditableTable.dataKey(rowIndex, columnIndex);
        const intent = this.isValidValue(value) ? null : Intent.DANGER;
        this.setSparseState("sparseCellIntent", dataKey, intent);
        this.setSparseState("sparseCellData", dataKey, value);
    };

    private cellSetter = (value: string, rowIndex: number, columnIndex: number) => {
        const dataKey = EditableTable.dataKey(rowIndex, columnIndex);
        const intent = this.isValidValue(value) ? null : Intent.DANGER;
        this.setSparseState("sparseCellData", dataKey, value);
        this.setSparseState("sparseCellIntent", dataKey, intent);
    };

    private setArrayState<T>(key: string, index: number, value: T) {
        const values = (this.state as any)[key].slice() as T[];
        values[index] = value;
        // TS doesn't know how to type-check parameterized string-literal keys,
        // so we have to cast to `any`. TS issue:
        // https://github.com/Microsoft/TypeScript/issues/15534
        this.setState({ [key]: values } as any);
    }

    private setSparseState<T>(stateKey: string, dataKey: string, value: T) {
        const stateData = (this.state as any)[stateKey] as { [key: string]: T };
        const values = { ...stateData, [dataKey]: value };
        this.setState({ [stateKey]: values } as any);
    }
}

const editableTableRoot = ReactDOM.createRoot(document.getElementById("table-editable-names"));
editableTableRoot.render(<EditableTable />);

const tableGhostRoot = ReactDOM.createRoot(document.getElementById("table-ghost"));
tableGhostRoot.render(
    getTableComponent(
        2,
        2,
        {},
        {
            enableGhostCells: true,
            selectionModes: SelectionModes.ALL,
        },
    ),
);

const tableInlineGhostRoot = ReactDOM.createRoot(document.getElementById("table-inline-ghost"));
tableInlineGhostRoot.render(
    getTableComponent(
        2,
        2,
        {},
        {
            enableGhostCells: true,
            selectionModes: SelectionModes.ALL,
        },
    ),
);

const tableBigRoot = ReactDOM.createRoot(document.getElementById("table-big"));
tableBigRoot.render(
    getTableComponent(
        200,
        100 * 1000,
        {},
        {
            enableGhostCells: true,
            selectionModes: SelectionModes.ALL,
        },
    ),
);

class RowSelectableTable extends React.Component {
    public state = {
        selectedRegions: [Regions.row(2)],
    };

    public render() {
        return (
            <div>
                <Table2
                    bodyContextMenuRenderer={bodyContextMenuRenderer}
                    numRows={7}
                    enableRowHeader={false}
                    onSelection={this.handleSelection}
                    selectedRegions={this.state.selectedRegions}
                    selectedRegionTransform={this.selectedRegionTransform}
                >
                    <Column name="Cells" />
                    <Column name="Select" />
                    <Column name="Rows" />
                </Table2>
                <br />
                <Button onClick={this.handleClear} intent={Intent.PRIMARY}>
                    Clear Selection
                </Button>
            </div>
        );
    }

    private handleClear = () => {
        this.setState({ selectedRegions: [] });
    };

    private handleSelection = (selectedRegions: Region[]) => {
        this.setState({ selectedRegions });
    };

    private selectedRegionTransform = (region: Region) => {
        // convert cell selection to row selection
        if (Regions.getRegionCardinality(region) === RegionCardinality.CELLS) {
            return Regions.row(region.rows[0], region.rows[1]);
        }

        return region;
    };
}

const tableSelectRowsRoot = ReactDOM.createRoot(document.getElementById("table-select-rows"));
tableSelectRowsRoot.render(<RowSelectableTable />);

document.getElementById("table-ledger").classList.add(Classes.HTML_TABLE_STRIPED);

const tableLedgerRoot = ReactDOM.createRoot(document.getElementById("table-ledger"));
tableLedgerRoot.render(getTableComponent(3, 7, {}, { className: "" }));

class AdjustableColumnsTable extends React.Component {
    public state = {
        columns: [<Column name="First" key={0} id={0} />, <Column name="Second" key={1} id={1} />],
    };

    public render() {
        return <Table2 numRows={7}>{this.state.columns}</Table2>;
    }

    public componentDidMount() {
        document.querySelector(".add-column-button").addEventListener("click", () => {
            this.add();
        });
        document.querySelector(".remove-column-button").addEventListener("click", () => {
            this.remove();
        });
        document.querySelector(".swap-columns-button").addEventListener("click", () => {
            this.swap(0, 1);
        });
    }

    private add() {
        const columns = this.state.columns.slice();
        columns.push(<Column key={columns.length} id={columns.length} />);
        this.setState({ columns });
    }

    private remove() {
        if (this.state.columns.length <= 2) {
            return;
        }
        const columns = this.state.columns.slice();
        columns.pop();
        this.setState({ columns });
    }

    private swap(a: number, b: number) {
        const columns = this.state.columns.slice();
        const tmpCol = columns[a];
        columns[a] = columns[b];
        columns[b] = tmpCol;
        this.setState({ columns });
    }
}

const tableColsRoot = ReactDOM.createRoot(document.getElementById("table-cols"));
tableColsRoot.render(<AdjustableColumnsTable />);

const intentRows: Intent[] = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.WARNING, Intent.DANGER];

const table1Root = ReactDOM.createRoot(document.getElementById("table-1"));
table1Root.render(
    getTableComponent(
        3,
        7,
        {
            cellRenderer(rowIndex: number, columnIndex: number) {
                return <Cell intent={intentRows[rowIndex]}>{Utils.toBase26Alpha(columnIndex) + (rowIndex + 1)}</Cell>;
            },
        },
        {
            enableColumnResizing: false,
            enableRowResizing: false,
            selectionModes: SelectionModes.NONE,
        },
    ),
);

const bodyContextMenuRenderer = (context: MenuContext) => {
    const getCellData = (row: number, col: number) => {
        return Utils.toBase26Alpha(col) + (row + 1);
    };

    return (
        <Menu>
            <CopyCellsMenuItem context={context} getCellData={getCellData} text="Copy Cells" />
        </Menu>
    );
};

const table2Root = ReactDOM.createRoot(document.getElementById("table-2"));
table2Root.render(
    getTableComponent(
        3,
        7,
        {},
        {
            bodyContextMenuRenderer,
            enableColumnResizing: true,
            enableMultipleSelection: true,
            enableRowResizing: true,
            selectionModes: SelectionModes.ALL,
        },
    ),
);

const table3Root = ReactDOM.createRoot(document.getElementById("table-3"));
table3Root.render(
    getTableComponent(
        3,
        7,
        {},
        {
            defaultColumnWidth: 60,
            enableRowHeader: false,
        },
    ),
);

const customRowHeaders = ["Superman", "Harry James Potter", "Deadpool", "Ben Folds", "Bitcoin", "Thorsday", "."];

const table4Root = ReactDOM.createRoot(document.getElementById("table-4"));
table4Root.render(
    getTableComponent(
        3,
        7,
        {},
        {
            renderRowHeaderCell: (rowIndex: number) => {
                return <RowHeaderCell name={customRowHeaders[rowIndex]} />;
            },
        },
    ),
);

const table5Root = ReactDOM.createRoot(document.getElementById("table-5"));
table5Root.render(
    getTableComponent(
        3,
        7,
        {
            columnHeaderCellRenderer: (columnIndex: number) => {
                return <ColumnHeaderCell name={Utils.toBase26Alpha(columnIndex)} isActive={columnIndex % 3 === 0} />;
            },
        },
        {
            styledRegionGroups: [
                {
                    className: "my-group",
                    regions: [Regions.cell(0, 0), Regions.row(2), Regions.cell(1, 2, 5, 2)],
                },
            ],
        },
    ),
);

const table6Root = ReactDOM.createRoot(document.getElementById("table-6"));
table6Root.render(
    getTableComponent(
        10,
        70,
        {
            columnHeaderCellRenderer: (columnIndex: number) => {
                const alpha = Utils.toBase26Alpha(columnIndex);
                return (
                    <ColumnHeaderCell
                        name={`${alpha} Column with a substantially long header name`}
                        menuRenderer={renderTestMenu}
                    >
                        <H4>Header {alpha}</H4>
                        <p>Whatever interactive header content goes here lorem ipsum.</p>
                    </ColumnHeaderCell>
                );
            },
        },
        {
            renderRowHeaderCell: (rowIndex: number) => {
                return <RowHeaderCell name={`${rowIndex + 1}`} menuRenderer={renderTestMenu} />;
            },
        },
    ),
);

class CustomHeaderCell extends React.Component<ColumnHeaderCellProps> {
    public render() {
        return <ColumnHeaderCell {...this.props}>Hey dawg.</ColumnHeaderCell>;
    }
}

const table7Root = ReactDOM.createRoot(document.getElementById("table-7"));
table7Root.render(
    getTableComponent(
        2,
        5,
        {
            columnHeaderCellRenderer: () => <CustomHeaderCell name="sup" />,
        },
        {
            enableMultipleSelection: false,
        },
    ),
);

const longContentRenderCell = () => {
    const long = "This-is-an-example-of-long-content-that-we-don't-want-to-wrap";
    return <Cell tooltip={long}>{long}</Cell>;
};

const table8Root = ReactDOM.createRoot(document.getElementById("table-8"));
table8Root.render(
    <Table2 numRows={4}>
        <Column name="My" />
        <Column name="Table" cellRenderer={longContentRenderCell} />
    </Table2>,
);

const table9Root = ReactDOM.createRoot(document.getElementById("table-9"));
table9Root.render(
    <div style={{ position: "relative" }}>
        <div style={{ zIndex: 0 }} className="stack-fill">
            Z = 0
        </div>
        <div style={{ zIndex: 1 }} className="stack-fill">
            Z = 1
        </div>
        <div style={{ zIndex: 2 }} className="stack-fill">
            <br />Z = 2
        </div>
        <Table2 numRows={3}>
            <Column name="A" />
            <Column name="B" />
            <Column name="C" />
        </Table2>
        <div className="stack-fill">
            <br />
            <br />
            after
        </div>
    </div>,
);

interface ReorderableTableExampleState {
    children?: React.JSX.Element[];
    data?: any[];
}

const REORDERABLE_TABLE_DATA = [
    ["A", "Apple", "Ape", "Albania", "Anchorage"],
    ["B", "Banana", "Boa", "Brazil", "Boston"],
    ["C", "Cranberry", "Cougar", "Croatia", "Chicago"],
    ["D", "Dragonfruit", "Deer", "Denmark", "Denver"],
    ["E", "Eggplant", "Elk", "Eritrea", "El Paso"],
].map(([letter, fruit, animal, country, city]) => ({ animal, city, country, fruit, letter }));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class ReorderableTableExample extends React.Component<{}, ReorderableTableExampleState> {
    public state: ReorderableTableExampleState = {
        data: REORDERABLE_TABLE_DATA,
    };

    public componentDidMount() {
        const children = [
            <Column key="1" name="Letter" cellRenderer={this.renderLetterCell} />,
            <Column key="2" name="Fruit" cellRenderer={this.renderFruitCell} />,
            <Column key="3" name="Animal" cellRenderer={this.renderAnimalCell} />,
            <Column key="4" name="Country" cellRenderer={this.renderCountryCell} />,
            <Column key="5" name="City" cellRenderer={this.renderCityCell} />,
        ];
        this.setState({ children });
    }

    public render() {
        return (
            <Table2
                enableColumnReordering={true}
                enableRowReordering={true}
                numRows={this.state.data.length}
                onColumnsReordered={this.handleColumnsReordered}
                onRowsReordered={this.handleRowsReordered}
            >
                {this.state.children}
            </Table2>
        );
    }

    private renderLetterCell = (row: number) => <Cell>{this.state.data[row].letter}</Cell>;

    private renderFruitCell = (row: number) => <Cell>{this.state.data[row].fruit}</Cell>;

    private renderAnimalCell = (row: number) => <Cell>{this.state.data[row].animal}</Cell>;

    private renderCountryCell = (row: number) => <Cell>{this.state.data[row].country}</Cell>;

    private renderCityCell = (row: number) => <Cell>{this.state.data[row].city}</Cell>;

    private handleColumnsReordered = (oldIndex: number, newIndex: number, length: number) => {
        if (oldIndex === newIndex) {
            return;
        }
        const nextChildren = Utils.reorderArray(this.state.children, oldIndex, newIndex, length);
        this.setState({ children: nextChildren });
    };

    private handleRowsReordered = (oldIndex: number, newIndex: number, length: number) => {
        if (oldIndex === newIndex) {
            return;
        }
        this.setState({ data: Utils.reorderArray(this.state.data, oldIndex, newIndex, length) });
    };
}

const table10Root = ReactDOM.createRoot(document.getElementById("table-10"));
table10Root.render(<ReorderableTableExample />);

const table11Root = ReactDOM.createRoot(document.getElementById("table-11"));
table11Root.render(
    <div style={{ height: 335, width: 300 }}>
        <Table2 numRows={10} defaultRowHeight={30} enableGhostCells={true}>
            <Column columnHeaderCellRenderer={() => <ColumnHeaderCell nameRenderer={renderName} />} />
        </Table2>
    </div>,
);

function renderName() {
    return (
        <div style={{ lineHeight: "100px" }}>
            <div className={Classes.TEXT_LARGE}>Large header Cell</div>
        </div>
    );
}

const table12Root = ReactDOM.createRoot(document.getElementById("table-12"));
table12Root.render(
    <div style={{ height: "auto", width: "180px" }}>
        <Table2 numRows={5} defaultRowHeight={30} enableGhostCells={true}>
            <Column name="Test" />
        </Table2>
    </div>,
);
