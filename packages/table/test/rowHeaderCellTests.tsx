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
 * limitations under the License.```
 */

import { expect } from "chai";
import { shallow } from "enzyme";
import * as React from "react";
import sinon from "sinon";

import { H4 } from "@blueprintjs/core";

import { RowHeaderCell } from "../src";
import * as Classes from "../src/common/classes";

import { ReactHarness } from "./harness";
import { createTableOfSize } from "./mocks/table";

describe("<RowHeaderCell>", () => {
    const harness = new ReactHarness();

    afterEach(() => {
        harness.unmount();
    });

    after(() => {
        harness.destroy();
    });

    it("Default renderer", () => {
        const table = harness.mount(createTableOfSize(3, 2));
        const text = table.find(`.${Classes.TABLE_ROW_NAME_TEXT}`, 1).text();
        expect(text).to.equal("2");
    });

    it("renders with custom className if provided", () => {
        const CLASS_NAME = "my-custom-class-name";
        const table = harness.mount(<RowHeaderCell className={CLASS_NAME} />);
        const hasCustomClass = table.find(`.${Classes.TABLE_HEADER}`, 0).hasClass(CLASS_NAME);
        expect(hasCustomClass).to.be.true;
    });

    it("passes index prop to nameRenderer callback if index was provided", () => {
        const renderNameStub = sinon.stub();
        renderNameStub.returns("string");
        const NAME = "my-name";
        const INDEX = 17;
        shallow(<RowHeaderCell index={INDEX} name={NAME} nameRenderer={renderNameStub} />);
        expect(renderNameStub.firstCall.args).to.deep.equal([NAME, INDEX]);
    });

    describe("Custom renderer", () => {
        it("renders custom name", () => {
            const rowHeaderCellRenderer = (rowIndex: number) => {
                return <RowHeaderCell name={`ROW-${rowIndex}`} />;
            };
            const table = harness.mount(createTableOfSize(3, 2, null, { rowHeaderCellRenderer }));
            const text = table.find(`.${Classes.TABLE_ROW_NAME_TEXT}`, 1).text();
            expect(text).to.equal("ROW-1");
        });

        it("renders custom content", () => {
            const rowHeaderCellRenderer = (rowIndex: number) => {
                return (
                    <RowHeaderCell name={`ROW-${rowIndex}`}>
                        <H4>Header of {rowIndex}</H4>
                    </RowHeaderCell>
                );
            };
            const table = harness.mount(createTableOfSize(3, 2, null, { rowHeaderCellRenderer }));
            const text = table.find(`.${Classes.TABLE_ROW_HEADERS} h4`, 1).text();
            expect(text).to.equal("Header of 1");
        });

        it("renders loading state properly", () => {
            const rowHeaderCellRenderer = (rowIndex: number) => {
                return <RowHeaderCell loading={rowIndex === 0} name="Row Header" />;
            };
            const table = harness.mount(createTableOfSize(2, 2, null, { rowHeaderCellRenderer }));
            expect(table.find(`.${Classes.TABLE_ROW_HEADERS} .${Classes.TABLE_HEADER}`, 0).text()).to.equal("");
            expect(table.find(`.${Classes.TABLE_ROW_HEADERS} .${Classes.TABLE_HEADER}`, 1).text()).to.equal(
                "Row Header",
            );
        });
    });
});
