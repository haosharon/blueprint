/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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
import { mount } from "enzyme";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import sinon from "sinon";

import * as Classes from "../../src/common/classes";
import { Grid } from "../../src/common/grid";
import * as ScrollUtils from "../../src/common/internal/scrollUtils";
import { QuadrantType } from "../../src/quadrants/tableQuadrant";
import { TableQuadrantStack } from "../../src/quadrants/tableQuadrantStack";

/**
 * <TableQuadrantStack> is responsible for sync'ing sizes and scroll positions
 * of all four child <TableQuadrant>s.
 */
describe("TableQuadrantStack", () => {
    const NUM_ROWS = 5;
    const NUM_COLUMNS = 5;

    const NUM_FROZEN_ROWS = 1;
    const NUM_FROZEN_COLUMNS = 1;

    const ROW_HEADER_WIDTH = 30;
    const COLUMN_HEADER_HEIGHT = 30;
    const EXPECTED_HEADER_BORDER_WIDTH = 1;

    // for Grid initialization
    const ROW_HEIGHT = 20;
    const COLUMN_WIDTH = 100;
    const ROW_HEIGHTS = Array(NUM_ROWS).fill(ROW_HEIGHT);
    const COLUMN_WIDTHS = Array(NUM_COLUMNS).fill(COLUMN_WIDTH);

    const GRID_HEIGHT = NUM_ROWS * ROW_HEIGHT;
    const GRID_WIDTH = NUM_COLUMNS * COLUMN_WIDTH;

    let grid: Grid;

    beforeEach(() => {
        grid = new Grid(ROW_HEIGHTS, COLUMN_WIDTHS);
    });

    it("emits refs using elements from the MAIN quadrant", () => {
        const quadrantRef = sinon.spy();
        const rowHeaderRef = sinon.spy();
        const columnHeaderRef = sinon.spy();
        const scrollContainerRef = sinon.spy();

        const columnHeaderRenderer = (refHandler: React.Ref<HTMLDivElement>) => {
            return <div ref={refHandler} />;
        };
        const rendeRowHeader = (refHandler: React.Ref<HTMLDivElement>) => {
            return <div ref={refHandler} />;
        };

        mount(
            <TableQuadrantStack
                grid={grid}
                bodyRenderer={sinon.spy()}
                quadrantRef={quadrantRef}
                rowHeaderRef={rowHeaderRef}
                columnHeaderRef={columnHeaderRef}
                scrollContainerRef={scrollContainerRef}
                columnHeaderRenderer={columnHeaderRenderer}
                rowHeaderRenderer={rendeRowHeader}
            />,
        );

        const isMainQuadrantChild = (refSpy: sinon.SinonSpy) => {
            const refElement = refSpy.firstCall.args[0] as HTMLElement;
            const quadrantElement = refElement.closest<HTMLElement>(`.${Classes.TABLE_QUADRANT_MAIN}`);
            return quadrantElement != null;
        };

        expect(isMainQuadrantChild(quadrantRef)).to.be.true;
        expect(isMainQuadrantChild(rowHeaderRef)).to.be.true;
        expect(isMainQuadrantChild(columnHeaderRef)).to.be.true;
        expect(isMainQuadrantChild(scrollContainerRef)).to.be.true;
    });

    it("on row resize, doesn't throw an error if handleRowResizeGuide not provided", () => {
        type ResizeHandler = (verticalGuides: number[]) => void;
        let resizeHandlerMain: ResizeHandler;

        const rowHeaderRenderer = (_a: any, resizeHandler: any) => {
            resizeHandlerMain = resizeHandler;
            return <div />;
        };

        mount(<TableQuadrantStack grid={grid} bodyRenderer={sinon.spy()} rowHeaderRenderer={rowHeaderRenderer} />);

        const HORIZONTAL_GUIDES = [1, 2, 3];
        expect(() => resizeHandlerMain(HORIZONTAL_GUIDES)).not.to.throw();
    });

    it("resizes quadrants to clear scrollbars if they are showing", () => {
        // make the container 1px smaller to force scrollbars to show
        const containerHeight = GRID_HEIGHT - 1;
        const containerWidth = GRID_WIDTH - 1;

        const containerStyle: React.CSSProperties = {
            height: containerHeight,
            overflow: "auto",
            width: containerWidth,
        };
        const bodyStyle = {
            height: GRID_HEIGHT,
            width: GRID_WIDTH,
        };

        const { container } = renderIntoDom(
            <div style={containerStyle}>
                <TableQuadrantStack grid={grid} bodyRenderer={sinon.stub().returns(<div style={bodyStyle} />)} />
            </div>,
        );
        const { mainQuadrant, topQuadrant, leftQuadrant } = findQuadrants(container);

        // measure the scrollbar size for our test environment.
        // we assume this utility works, because it's unit-tested elsewhere.
        const mainScrollContainer = mainQuadrant.querySelector<HTMLElement>(
            `.${Classes.TABLE_QUADRANT_SCROLL_CONTAINER}`,
        )!;
        const scrollbarSize = ScrollUtils.measureScrollBarThickness(mainScrollContainer, "vertical");

        const { width: mainWidth, height: mainHeight } = mainQuadrant.getBoundingClientRect();
        expect(mainWidth).to.equal(containerWidth);
        expect(mainHeight).to.equal(containerHeight);

        const { width: topWidth } = topQuadrant.getBoundingClientRect();
        expect(topWidth).to.equal(containerWidth - scrollbarSize);

        const { height: leftHeight } = leftQuadrant.getBoundingClientRect();
        expect(leftHeight).to.equal(containerHeight - scrollbarSize);
    });

    it("resizes quadrants to be flush with parent if scrollbars are not showing", () => {
        // make the container big enough to fit the grid without scrolling
        const containerHeight = GRID_HEIGHT * 2;
        const containerWidth = GRID_WIDTH * 2;

        const containerStyle: React.CSSProperties = {
            height: containerHeight,
            overflow: "auto",
            width: containerWidth,
        };
        const bodyStyle = {
            height: GRID_HEIGHT,
            width: GRID_WIDTH,
        };

        const { container } = renderIntoDom(
            <div style={containerStyle}>
                <TableQuadrantStack grid={grid} bodyRenderer={sinon.stub().returns(<div style={bodyStyle} />)} />
            </div>,
        );

        const { mainQuadrant, topQuadrant, leftQuadrant } = findQuadrants(container);

        const { width: mainWidth, height: mainHeight } = mainQuadrant.getBoundingClientRect();
        expect(mainWidth).to.equal(containerWidth);
        expect(mainHeight).to.equal(containerHeight);

        const { width: topWidth } = topQuadrant.getBoundingClientRect();
        expect(topWidth).to.equal(containerWidth);

        const { height: leftHeight } = leftQuadrant.getBoundingClientRect();
        expect(leftHeight).to.equal(containerHeight);
    });

    describe("Initial render", () => {
        it("renders four quadrants (one of each type)", () => {
            const bodyRenderer = sinon.spy();
            const component = mount(<TableQuadrantStack grid={grid} bodyRenderer={bodyRenderer} />);
            const element = component.getDOMNode<HTMLElement>();
            expect(element.classList.contains(Classes.TABLE_QUADRANT_STACK));
            expect(element.children.item(0)?.classList.contains(Classes.TABLE_QUADRANT_MAIN));
            expect(element.children.item(1)?.classList.contains(Classes.TABLE_QUADRANT_TOP));
            expect(element.children.item(2)?.classList.contains(Classes.TABLE_QUADRANT_LEFT));
            expect(element.children.item(3)?.classList.contains(Classes.TABLE_QUADRANT_TOP_LEFT));
        });

        it("invokes menuRenderer once for each quadrant on mount", () => {
            const bodyRenderer = sinon.spy();
            const menuRenderer = sinon.spy();
            mount(<TableQuadrantStack grid={grid} bodyRenderer={bodyRenderer} menuRenderer={menuRenderer} />);
            expect(menuRenderer.callCount).to.equal(4);
        });

        it("invokes columnHeaderRenderer once for each quadrant on mount", () => {
            const bodyRenderer = sinon.spy();
            const columnHeaderRenderer = sinon.spy();
            mount(
                <TableQuadrantStack
                    grid={grid}
                    bodyRenderer={bodyRenderer}
                    columnHeaderRenderer={columnHeaderRenderer}
                />,
            );
            expect(columnHeaderRenderer.callCount).to.equal(4);
        });

        it("does not invoke columnHeaderRenderer on mount if enableColumnHeader={false}", () => {
            const bodyRenderer = sinon.spy();
            const columnHeaderRenderer = sinon.spy();
            mount(
                <TableQuadrantStack
                    grid={grid}
                    bodyRenderer={bodyRenderer}
                    enableColumnHeader={false}
                    columnHeaderRenderer={columnHeaderRenderer}
                />,
            );
            expect(columnHeaderRenderer.callCount).to.equal(0);
        });

        it("invokes rowHeaderRenderer once for each quadrant on mount", () => {
            const bodyRenderer = sinon.spy();
            const rowHeaderRenderer = sinon.spy();
            mount(<TableQuadrantStack grid={grid} bodyRenderer={bodyRenderer} rowHeaderRenderer={rowHeaderRenderer} />);
            expect(rowHeaderRenderer.callCount).to.equal(4);
        });

        it("does not render LEFT/TOP_LEFT quadrants if row header not shown and no frozen columns", () => {
            const component = mount(
                <TableQuadrantStack grid={grid} bodyRenderer={sinon.spy()} enableRowHeader={false} />,
            );
            expect(component.find(`.${Classes.TABLE_QUADRANT_LEFT}`)).to.be.empty;
            expect(component.find(`.${Classes.TABLE_QUADRANT_TOP_LEFT}`)).to.be.empty;
        });
    });

    describe("Resize callbacks", () => {
        type ResizeHandler = (verticalGuides: number[]) => void;
        let resizeHandler: ResizeHandler;

        // this will be called four times, but doesn't matter.
        const renderRowOrColumnHeader = (_a: any, resizeHandlerInstance: any) => {
            resizeHandler = resizeHandlerInstance;
            return <div />;
        };

        describe("on column resize", () => {
            it("doesn't throw an error if handleColumnResizeGuide not provided", () => {
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        bodyRenderer={sinon.spy()}
                        columnHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                expect(() => resizeHandler([])).not.to.throw();
            });

            it("invokes props.handleColumnResizeGuide if provided", () => {
                const handleColumnResizeGuide = sinon.spy();
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        handleColumnResizeGuide={handleColumnResizeGuide}
                        bodyRenderer={sinon.spy()}
                        columnHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                resizeHandler([]);
                expect(handleColumnResizeGuide.calledOnce).to.be.true;
            });
        });

        describe("on row resize", () => {
            it("doesn't throw an error if handleRowResizeGuide not provided", () => {
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        bodyRenderer={sinon.spy()}
                        rowHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                expect(() => resizeHandler([])).not.to.throw();
            });

            it("invokes props.handleRowResizeGuide if provided", () => {
                const handleRowResizeGuide = sinon.spy();
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        handleRowResizeGuide={handleRowResizeGuide}
                        bodyRenderer={sinon.spy()}
                        rowHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                resizeHandler([]);
                expect(handleRowResizeGuide.calledOnce).to.be.true;
            });
        });
    });

    describe("Reordering callbacks", () => {
        type ReorderingHandler = (oldIndex: number, newIndex: number, length: number) => void;
        let reorderingHandler: ReorderingHandler;

        // this will be called four times, but doesn't matter.
        const renderRowOrColumnHeader = (_a: any, _b: any, reorderingHandlerInstance: any) => {
            reorderingHandler = reorderingHandlerInstance;
            return <div />;
        };

        describe("on column resize", () => {
            it("doesn't throw an error if handleColumnsReordering not provided", () => {
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        bodyRenderer={sinon.spy()}
                        columnHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                expect(() => reorderingHandler(1, 2, 3)).not.to.throw();
            });

            it("invokes props.handleColumnsReordering if provided", () => {
                const handleColumnsReordering = sinon.spy();
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        handleColumnsReordering={handleColumnsReordering}
                        bodyRenderer={sinon.spy()}
                        columnHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                reorderingHandler(1, 2, 3);
                expect(handleColumnsReordering.calledOnce).to.be.true;
            });
        });

        describe("on row resize", () => {
            it("doesn't throw an error if handleRowsReordering not provided", () => {
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        bodyRenderer={sinon.spy()}
                        rowHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                expect(() => reorderingHandler(1, 2, 3)).not.to.throw();
            });

            it("invokes props.handleRowsReordering if provided", () => {
                const handleRowsReordering = sinon.spy();
                mount(
                    <TableQuadrantStack
                        grid={grid}
                        handleRowsReordering={handleRowsReordering}
                        bodyRenderer={sinon.spy()}
                        rowHeaderRenderer={renderRowOrColumnHeader}
                    />,
                );
                reorderingHandler(1, 2, 3);
                expect(handleRowsReordering.calledOnce).to.be.true;
            });
        });
    });

    describe("Size syncing", () => {
        describe("if numFrozenRows == 0 && numFrozenColumns == 0", () => {
            it("syncs initial quadrant sizes properly", () => {
                assertDefaultQuadrantSizesCorrect(0, 0);
            });

            it("syncs quadrants sizes properly when row header hidden", () => {
                assertQuadrantSizesCorrectIfRowHeadersHidden(0, 0);
            });
        });

        describe("if numFrozenRows > 0 && numFrozenColumns == 0", () => {
            it("syncs initial quadrant sizes properly", () => {
                assertDefaultQuadrantSizesCorrect(NUM_FROZEN_ROWS, 0);
            });

            it("syncs quadrants sizes properly when row header hidden", () => {
                assertQuadrantSizesCorrectIfRowHeadersHidden(NUM_FROZEN_ROWS, 0);
            });
        });

        describe("if numFrozenRows == 0 && numFrozenColumns > 0", () => {
            it("syncs initial quadrant sizes properly", () => {
                assertDefaultQuadrantSizesCorrect(0, NUM_FROZEN_COLUMNS);
            });

            it("syncs quadrants sizes properly when row header hidden", () => {
                assertQuadrantSizesCorrectIfRowHeadersHidden(0, NUM_FROZEN_COLUMNS);
            });
        });

        describe("if numFrozenRows > 0 && numFrozenColumns > 0", () => {
            it("syncs initial quadrant sizes properly", () => {
                assertDefaultQuadrantSizesCorrect(NUM_FROZEN_ROWS, NUM_FROZEN_COLUMNS);
            });

            it("syncs quadrants sizes properly when row header hidden", () => {
                assertQuadrantSizesCorrectIfRowHeadersHidden(NUM_FROZEN_ROWS, NUM_FROZEN_COLUMNS);
            });
        });

        function assertDefaultQuadrantSizesCorrect(numFrozenRows: number, numFrozenColumns: number) {
            const rowHeaderRenderer = (refHandler: React.Ref<HTMLDivElement>) => {
                // need to set the width on a child so the header maintains its size
                // when the component measures the "desired" row-header width (by
                // setting width:auto on the parent here).
                return (
                    <div ref={refHandler} style={{ height: "100%" }}>
                        <div style={{ width: ROW_HEADER_WIDTH }} />
                    </div>
                );
            };
            const columnHeaderRenderer = (refHandler: React.Ref<HTMLDivElement>) => {
                return <div ref={refHandler} style={{ height: COLUMN_HEADER_HEIGHT, width: "100%" }} />;
            };

            const { container } = renderIntoDom(
                <TableQuadrantStack
                    grid={grid}
                    numFrozenColumns={numFrozenColumns}
                    numFrozenRows={numFrozenRows}
                    bodyRenderer={renderGridBody()}
                    rowHeaderRenderer={rowHeaderRenderer}
                    columnHeaderRenderer={columnHeaderRenderer}
                />,
            );

            const expectedWidth =
                numFrozenColumns === 0
                    ? ROW_HEADER_WIDTH + EXPECTED_HEADER_BORDER_WIDTH
                    : ROW_HEADER_WIDTH + numFrozenColumns * COLUMN_WIDTH;
            const expectedHeight =
                numFrozenRows === 0
                    ? COLUMN_HEADER_HEIGHT + EXPECTED_HEADER_BORDER_WIDTH
                    : COLUMN_HEADER_HEIGHT + numFrozenRows * ROW_HEIGHT;
            assertNonMainQuadrantSizesCorrect(container, expectedWidth, expectedHeight);
        }

        function assertQuadrantSizesCorrectIfRowHeadersHidden(numFrozenRows: number, numFrozenColumns: number) {
            const columnHeaderRenderer = (refHandler: React.Ref<HTMLDivElement>) => {
                return <div ref={refHandler} style={{ height: COLUMN_HEADER_HEIGHT, width: "100%" }} />;
            };

            const { container } = renderIntoDom(
                <TableQuadrantStack
                    grid={grid}
                    enableRowHeader={false}
                    numFrozenColumns={numFrozenColumns}
                    numFrozenRows={numFrozenRows}
                    bodyRenderer={renderGridBody()}
                    columnHeaderRenderer={columnHeaderRenderer}
                />,
            );

            const expectedHeight =
                COLUMN_HEADER_HEIGHT +
                (numFrozenRows === 0 ? EXPECTED_HEADER_BORDER_WIDTH : numFrozenRows * ROW_HEIGHT);

            const { topQuadrant, leftQuadrant, topLeftQuadrant } = findQuadrants(container);

            if (numFrozenColumns === 0) {
                expect(leftQuadrant).to.be.null;
                expect(topLeftQuadrant).to.be.null;
                assertStyleEquals(topQuadrant, "height", toPxString(expectedHeight));
            } else {
                const expectedWidth = numFrozenColumns * COLUMN_WIDTH;
                assertNonMainQuadrantSizesCorrect(container, expectedWidth, expectedHeight);
            }
        }

        function assertNonMainQuadrantSizesCorrect(
            component: HTMLElement,
            expectedWidth: number,
            expectedHeight: number,
        ) {
            const expectedWidthString = toPxString(expectedWidth);
            const expectedHeightString = toPxString(expectedHeight);

            const { topQuadrant, leftQuadrant, topLeftQuadrant } = findQuadrants(component);

            assertStyleEquals(leftQuadrant, "width", expectedWidthString);
            assertStyleEquals(topQuadrant, "height", expectedHeightString);
            assertStyleEquals(topLeftQuadrant, "width", expectedWidthString);
            assertStyleEquals(topLeftQuadrant, "height", expectedHeightString);
        }

        function assertStyleEquals(element: HTMLElement, key: keyof CSSStyleDeclaration, expectedValue: any) {
            expect(element.style[key]).to.equal(expectedValue);
        }

        function toPxString(value: number) {
            return `${value}px`;
        }
    });

    describe("Scroll syncing", () => {
        let container: HTMLElement;
        let leftScrollContainer: HTMLElement;
        let mainScrollContainer: HTMLElement;
        let topScrollContainer: HTMLElement;
        let topLeftScrollContainer: HTMLElement;

        const onScroll = sinon.spy();

        // use a negative value to force synchronous view updates.
        const DISABLED_VIEW_SYNC_DELAY = -1;

        // container should be smaller than the grid to enable scrolling
        const CONTAINER_WIDTH = GRID_WIDTH - 1;
        const CONTAINER_HEIGHT = GRID_HEIGHT - 1;

        // container isn't *that* much smaller in these tests, so don't expect
        // that huge scroll offsets will be possible. tiny values suffice here.
        const SCROLL_OFFSET_X = 2;
        const SCROLL_OFFSET_Y = 3;

        beforeEach(() => {
            /**
             * Testing scrolling when throttling and debouncing are enabled is a
             * huge pain, so disable both.
             */
            const result = renderIntoDom(
                <div style={{ height: CONTAINER_HEIGHT, width: CONTAINER_WIDTH }}>
                    <TableQuadrantStack
                        grid={grid}
                        onScroll={onScroll}
                        bodyRenderer={renderGridBody()}
                        throttleScrolling={false}
                        viewSyncDelay={DISABLED_VIEW_SYNC_DELAY}
                    />
                </div>,
            );
            container = result.container;

            // can't destructure into existing, mutable variables; so need to assign each explicitly
            const scrollContainers = findQuadrantScrollContainers(container);
            mainScrollContainer = scrollContainers.mainScrollContainer;
            leftScrollContainer = scrollContainers.leftScrollContainer;
            topScrollContainer = scrollContainers.topScrollContainer;
            topLeftScrollContainer = scrollContainers.topLeftScrollContainer;
        });

        afterEach(() => {
            container.remove();
            onScroll.resetHistory();
        });

        describe("onScroll", () => {
            // "wheel" is invoked before "scroll"; both listeners may invoke
            // onScroll, but we want it to be invoked just once on each "wheel"
            // event. thus, use the stricter `calledOnce` instead of `called`.

            it("invokes onScroll on MAIN quadrant scroll", () => {
                TestUtils.Simulate.scroll(mainScrollContainer);
                expect(onScroll.calledOnce).to.be.true;
            });

            it("invokes onScroll on MAIN quadrant wheel", () => {
                TestUtils.Simulate.wheel(mainScrollContainer);
                expect(onScroll.calledOnce).to.be.true;
            });

            it("invokes onScroll on TOP quadrant wheel", () => {
                TestUtils.Simulate.wheel(topScrollContainer);
                expect(onScroll.calledOnce).to.be.true;
            });

            it("invokes onScroll on LEFT quadrant wheel", () => {
                TestUtils.Simulate.wheel(leftScrollContainer);
                expect(onScroll.calledOnce).to.be.true;
            });

            it("invokes onScroll on TOP_LEFT quadrant wheel", () => {
                TestUtils.Simulate.wheel(topLeftScrollContainer);
                expect(onScroll.calledOnce).to.be.true;
            });
        });

        describe("throttleScrolling", () => {
            it("throttles scrolling by default", () => {
                // need to do a full mount to get defaultProps to apply
                const stack = mount(<TableQuadrantStack grid={grid} bodyRenderer={renderGridBody()} />);
                expect(stack.props().throttleScrolling).to.be.true;
            });
        });

        it("syncs quadrant scroll offsets when scrolling the main quadrant", () => {
            // simulating a "scroll" or "wheel" event doesn't seem to affect the
            // scrollTop/scrollLeft the way it would in practice, so we need to tweak those
            // explicitly before triggering.
            mainScrollContainer.scrollLeft = SCROLL_OFFSET_X;
            mainScrollContainer.scrollTop = SCROLL_OFFSET_Y;

            TestUtils.Simulate.scroll(mainScrollContainer);

            assertScrollPositionEquals(topScrollContainer, SCROLL_OFFSET_X, 0);
            assertScrollPositionEquals(leftScrollContainer, 0, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(topLeftScrollContainer, 0, 0);
        });

        it("syncs quadrant scroll offsets when mouse-wheeling in the main quadrant", () => {
            TestUtils.Simulate.wheel(mainScrollContainer, {
                deltaX: SCROLL_OFFSET_X,
                deltaY: SCROLL_OFFSET_Y,
            });

            assertScrollPositionEquals(topScrollContainer, SCROLL_OFFSET_X, 0);
            assertScrollPositionEquals(leftScrollContainer, 0, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(topLeftScrollContainer, 0, 0);
        });

        it("syncs quadrant scroll offsets when mouse-wheeling in the top quadrant", () => {
            topScrollContainer.scrollLeft = SCROLL_OFFSET_X;
            TestUtils.Simulate.wheel(topScrollContainer, {
                deltaX: SCROLL_OFFSET_X,
                deltaY: SCROLL_OFFSET_Y,
            });

            assertScrollPositionEquals(mainScrollContainer, SCROLL_OFFSET_X, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(leftScrollContainer, 0, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(topLeftScrollContainer, 0, 0);
        });

        it("syncs quadrant scroll offsets when mouse-wheeling in the left quadrant", () => {
            leftScrollContainer.scrollTop = SCROLL_OFFSET_Y;
            TestUtils.Simulate.wheel(leftScrollContainer, {
                deltaX: SCROLL_OFFSET_X,
                deltaY: SCROLL_OFFSET_Y,
            });

            assertScrollPositionEquals(mainScrollContainer, SCROLL_OFFSET_X, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(topScrollContainer, SCROLL_OFFSET_X, 0);
            assertScrollPositionEquals(topLeftScrollContainer, 0, 0);
        });

        it("syncs quadrant scroll offsets when mouse-wheeling in the top-left quadrant", () => {
            TestUtils.Simulate.wheel(topLeftScrollContainer, {
                deltaX: SCROLL_OFFSET_X,
                deltaY: SCROLL_OFFSET_Y,
            });

            assertScrollPositionEquals(mainScrollContainer, SCROLL_OFFSET_X, SCROLL_OFFSET_Y);
            assertScrollPositionEquals(topScrollContainer, SCROLL_OFFSET_X, 0);
            assertScrollPositionEquals(leftScrollContainer, 0, SCROLL_OFFSET_Y);
        });

        function assertScrollPositionEquals(element: Element, scrollLeft: number, scrollTop: number) {
            expect(element.scrollLeft).to.equal(scrollLeft);
            expect(element.scrollTop).to.equal(scrollTop);
        }

        function findQuadrantScrollContainers(element: HTMLElement) {
            // this order is clearer than alphabetical order
            /* eslint-disable sort-keys */
            return {
                leftScrollContainer: findQuadrantScrollContainer(element, QuadrantType.LEFT),
                mainScrollContainer: findQuadrantScrollContainer(element, QuadrantType.MAIN),
                topScrollContainer: findQuadrantScrollContainer(element, QuadrantType.TOP),
                topLeftScrollContainer: findQuadrantScrollContainer(element, QuadrantType.TOP_LEFT),
            };
            /* eslint-enable sort-keys */
        }

        function findQuadrantScrollContainer(element: HTMLElement, quadrantType: QuadrantType) {
            const quadrantClass = getQuadrantCssClass(quadrantType);
            return element.querySelector<HTMLElement>(`.${quadrantClass} .${Classes.TABLE_QUADRANT_SCROLL_CONTAINER}`)!;
        }

        function getQuadrantCssClass(quadrantType: QuadrantType) {
            switch (quadrantType) {
                case QuadrantType.MAIN:
                    return Classes.TABLE_QUADRANT_MAIN;
                case QuadrantType.TOP:
                    return Classes.TABLE_QUADRANT_TOP;
                case QuadrantType.LEFT:
                    return Classes.TABLE_QUADRANT_LEFT;
                case QuadrantType.TOP_LEFT:
                    return Classes.TABLE_QUADRANT_TOP_LEFT;
                default:
                    return undefined;
            }
        }
    });

    function findQuadrants(element: HTMLElement) {
        // this order is clearer than alphabetical order
        /* eslint-disable sort-keys */
        return {
            mainQuadrant: element.querySelector<HTMLElement>(`.${Classes.TABLE_QUADRANT_MAIN}`)!,
            leftQuadrant: element.querySelector<HTMLElement>(`.${Classes.TABLE_QUADRANT_LEFT}`)!,
            topQuadrant: element.querySelector<HTMLElement>(`.${Classes.TABLE_QUADRANT_TOP}`)!,
            topLeftQuadrant: element.querySelector<HTMLElement>(`.${Classes.TABLE_QUADRANT_TOP_LEFT}`)!,
        };
        /* eslint-enable sort-keys */
    }

    function renderIntoDom(element: React.JSX.Element) {
        const containerElement = document.createElement("div");
        document.body.appendChild(containerElement);
        mount(element, { attachTo: containerElement });
        return { container: containerElement };
    }

    function renderGridBody() {
        return sinon.stub().returns(<div style={{ height: GRID_HEIGHT, width: GRID_WIDTH }} />);
    }
});
