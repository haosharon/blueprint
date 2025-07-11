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

import * as React from "react";

import { RadioGroup } from "@blueprintjs/core";
import { Example, type ExampleProps, handleStringChange } from "@blueprintjs/docs-theme";
import { Cell, Column, ColumnHeaderCell, RowHeaderCell, Table } from "@blueprintjs/table";

interface BigSpaceRock {
    [key: string]: number | string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bigSpaceRocks: BigSpaceRock[] = require("./potentiallyHazardousAsteroids.json");

export const CellsLoadingConfiguration = {
    ALL: "all" as const,
    FIRST_COLUMN: "first-column" as const,
    FIRST_ROW: "first-row" as const,
    NONE: "none" as const,
    RANDOM: "random" as const,
};
export type CellsLoadingConfiguration = (typeof CellsLoadingConfiguration)[keyof typeof CellsLoadingConfiguration];

const CONFIGURATIONS = [
    { label: "All cells", value: CellsLoadingConfiguration.ALL },
    { label: "First column", value: CellsLoadingConfiguration.FIRST_COLUMN },
    { label: "First row", value: CellsLoadingConfiguration.FIRST_ROW },
    { label: "Random", value: CellsLoadingConfiguration.RANDOM },
    { label: "None", value: CellsLoadingConfiguration.NONE },
];

export interface CellLoadingExampleState {
    configuration?: CellsLoadingConfiguration;
    randomNumbers?: number[];
}

export class CellLoadingExample extends React.PureComponent<ExampleProps, CellLoadingExampleState> {
    public state: CellLoadingExampleState = {
        configuration: CellsLoadingConfiguration.ALL,
    };

    private handleConfigurationChange = handleStringChange(configuration => {
        if (configuration === CellsLoadingConfiguration.RANDOM) {
            // calculate random numbers just once instead of inside cellRenderer which is called during table scrolling
            const randomNumbers: number[] = [];
            const numberOfCells = bigSpaceRocks.length * Object.keys(bigSpaceRocks[0]).length;
            for (let i = 0; i < numberOfCells; i++) {
                randomNumbers.push(Math.random());
            }
            this.setState({ randomNumbers });
        }
        this.setState({ configuration: configuration as CellsLoadingConfiguration });
    });

    public render() {
        const options = (
            <RadioGroup
                label="Example cell loading configurations"
                selectedValue={this.state.configuration}
                options={CONFIGURATIONS}
                onChange={this.handleConfigurationChange}
            />
        );
        return (
            <Example options={options} showOptionsBelowExample={true} {...this.props}>
                <Table
                    numRows={bigSpaceRocks.length}
                    rowHeaderCellRenderer={this.renderRowHeaderCell}
                    enableColumnInteractionBar={true}
                >
                    {this.renderColumns()}
                </Table>
            </Example>
        );
    }

    private renderColumns() {
        const columns: React.JSX.Element[] = [];

        Object.keys(bigSpaceRocks[0]).forEach(columnName => {
            const formattedColumnName = columnName
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, firstCharacter => firstCharacter.toUpperCase());
            columns.push(
                <Column
                    key={formattedColumnName}
                    cellRenderer={this.renderCell}
                    columnHeaderCellRenderer={this.renderColumnHeaderCell}
                />,
            );
        });

        return columns;
    }

    private renderCell = (rowIndex: number, columnIndex: number) => {
        const bigSpaceRock = bigSpaceRocks[rowIndex];
        return (
            <Cell loading={this.isLoading(rowIndex + 1, columnIndex + 1)}>
                {bigSpaceRock[Object.keys(bigSpaceRock)[columnIndex]]}
            </Cell>
        );
    };

    private renderColumnHeaderCell = (columnIndex: number) => {
        const columnName = Object.keys(bigSpaceRocks[0])[columnIndex];
        const formattedColumnName = columnName
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, firstCharacter => firstCharacter.toUpperCase());
        return <ColumnHeaderCell loading={this.isLoading(0, columnIndex + 1)} name={formattedColumnName} />;
    };

    private renderRowHeaderCell = (rowIndex: number) => {
        return <RowHeaderCell loading={this.isLoading(rowIndex + 1, 0)} name={`${rowIndex + 1}`} />;
    };

    private isLoading = (rowIndex: number, columnIndex: number) => {
        switch (this.state.configuration) {
            case CellsLoadingConfiguration.ALL:
                return true;
            case CellsLoadingConfiguration.FIRST_COLUMN:
                return columnIndex === 1;
            case CellsLoadingConfiguration.FIRST_ROW:
                return rowIndex === 1;
            case CellsLoadingConfiguration.NONE:
                return false;
            case CellsLoadingConfiguration.RANDOM:
                const numColumns = Object.keys(bigSpaceRocks[0]).length;
                return this.state.randomNumbers[rowIndex * numColumns + columnIndex] > 0.4;
            default:
                throw new Error(`Unexpected value: ${this.state.configuration}`);
        }
    };
}
