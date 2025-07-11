/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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

import { assert } from "chai";
import { mount, type ReactWrapper } from "enzyme";
import * as React from "react";
import sinon from "sinon";

import { expectPropValidationError } from "@blueprintjs/test-commons";

import { Classes, MultiSlider, type MultiSliderProps } from "../../src";
import { Handle } from "../../src/components/slider/handle";
import { MultiSliderHandle } from "../../src/components/slider/multiSlider";

import { mouseUpHorizontal, simulateMovement } from "./sliderTestUtils";

const STEP_SIZE = 20;

describe("<MultiSlider>", () => {
    let containerElement: HTMLElement;

    let onChange: sinon.SinonSpy;
    let onRelease: sinon.SinonSpy;

    beforeEach(() => {
        // need an element in the document for tickSize to be a real number
        containerElement = document.createElement("div");
        // default min-max is 0-10 so there are 10 steps
        containerElement.style.width = `${STEP_SIZE * 10}px`;
        document.body.appendChild(containerElement);

        onChange = sinon.spy();
        onRelease = sinon.spy();
    });

    afterEach(() => {
        containerElement.remove();
    });

    describe("handles", () => {
        it("handle values are automatically sorted", () => {
            const slider = renderSlider({ onRelease, values: [5, 10, 0] });
            slider.find(Handle).first().simulate("mousedown", { clientX: 0 });
            mouseUpHorizontal(0);
            assert.equal(onRelease.callCount, 1);
            assert.deepEqual(onRelease.firstCall.args[0], [0, 5, 10]);
        });

        it("propagates className to the handles", () => {
            const slider = mount(
                <MultiSlider>
                    <MultiSliderHandle value={3} className="testClass" />
                    <MultiSliderHandle value={5} />
                </MultiSlider>,
                { attachTo: containerElement },
            );
            assert.lengthOf(slider.find("span.testClass"), 1);
        });

        it("moving mouse on the first handle updates the first value", () => {
            const slider = renderSlider({ onChange });
            simulateMovement(slider, { dragSize: STEP_SIZE, dragTimes: 4, handleIndex: 0 });
            // called 3 times for the move to 1, 2, 3, and 4
            assert.equal(onChange.callCount, 4);
            assert.deepEqual(
                onChange.args.map(arg => arg[0]),
                [
                    [1, 5, 10],
                    [2, 5, 10],
                    [3, 5, 10],
                    [4, 5, 10],
                ],
            );
        });

        it("moving mouse on the middle handle updates the middle value", () => {
            const slider = renderSlider({ onChange });
            simulateMovement(slider, {
                dragSize: STEP_SIZE,
                dragTimes: 4,
                from: STEP_SIZE * 5,
                handleIndex: 1,
            });
            // called 3 times for the move to 6, 7, 8, and 9
            assert.equal(onChange.callCount, 4);
            assert.deepEqual(
                onChange.args.map(arg => arg[0]),
                [
                    [0, 6, 10],
                    [0, 7, 10],
                    [0, 8, 10],
                    [0, 9, 10],
                ],
            );
        });

        it("moving mouse on the last handle updates the last value", () => {
            const slider = renderSlider({ onChange });
            simulateMovement(slider, {
                dragSize: -STEP_SIZE,
                dragTimes: 4,
                from: STEP_SIZE * 10,
                handleIndex: 2,
            });
            // called 3 times for the move to 9, 8, 7, and 6
            assert.equal(onChange.callCount, 4);
            assert.deepEqual(
                onChange.args.map(arg => arg[0]),
                [
                    [0, 5, 9],
                    [0, 5, 8],
                    [0, 5, 7],
                    [0, 5, 6],
                ],
            );
        });

        it("releasing mouse on a track value closer to the first handle moves the first handle", () => {
            const slider = renderSlider({ onChange });
            slider.simulate("mousedown", { clientX: STEP_SIZE });
            assert.equal(onChange.callCount, 1);
            assert.deepEqual(onChange.firstCall.args[0], [1, 5, 10]);
        });

        it("releasing mouse on a track value slightly below the middle handle moves the middle handle", () => {
            const slider = renderSlider({ onChange });
            slider.simulate("mousedown", { clientX: STEP_SIZE * 4 });
            assert.equal(onChange.callCount, 1);
            assert.deepEqual(onChange.firstCall.args[0], [0, 4, 10]);
        });

        it("releasing mouse on a track value slightly above the middle handle moves the middle handle", () => {
            const slider = renderSlider({ onChange });
            slider.simulate("mousedown", { clientX: STEP_SIZE * 6 });
            assert.equal(onChange.callCount, 1);
            assert.deepEqual(onChange.firstCall.args[0], [0, 6, 10]);
        });

        it("releasing mouse on a track value closer to the last handle moves the last handle", () => {
            const slider = renderSlider({ onChange });
            slider.simulate("mousedown", { clientX: STEP_SIZE * 9 });
            assert.equal(onChange.callCount, 1);
            assert.deepEqual(onChange.firstCall.args[0], [0, 5, 9]);
        });

        it("when values are equal, releasing mouse on a track still moves the nearest handle", () => {
            const slider = renderSlider({ onChange, values: [5, 5, 7] });

            slider.simulate("mousedown", { clientX: STEP_SIZE * 1 });
            assert.equal(onChange.callCount, 1, "one lower handle invokes onChange");
            assert.deepEqual(onChange.firstCall.args[0], [1, 5, 7], "one lower handle moves");
            onChange.resetHistory();

            slider.simulate("mousedown", { clientX: STEP_SIZE * 9 });
            assert.equal(onChange.callCount, 1, "higher handle invokes onChange");
            assert.deepEqual(onChange.firstCall.args[0], [5, 5, 9], "higher handle moves");
        });

        it("values outside of bounds are clamped", () => {
            const slider = renderSlider({ values: [-1, 5, 12] });
            slider.find(`.${Classes.SLIDER_PROGRESS}`).forEach(progress => {
                const { left, right } = progress.prop("style")!;
                // CSS properties are percentage strings, but parsing will ignore trailing "%".
                // percentages should be in 0-100% range.
                assert.isAtLeast(parseFloat(left!.toString()), 0);
                assert.isAtMost(parseFloat(right!.toString()), 100);
            });
        });
    });

    describe("labels", () => {
        it("renders label with labelStepSize fallback of 1 when not provided", () => {
            // [0 1 2 3 4 5]
            const wrapper = renderSlider({ max: 5, min: 0 });
            assertLabelCount(wrapper, 6);
        });

        it("renders label for value and for each labelStepSize", () => {
            // [0  10  20  30  40  50]
            const wrapper = renderSlider({ labelStepSize: 10, max: 50, min: 0 });
            assertLabelCount(wrapper, 6);
        });

        it("renders labels provided in labelValues prop", () => {
            const labelValues = [0, 30, 50, 60];
            const wrapper = renderSlider({ labelValues, max: 50, min: 0 });
            assertLabelCount(wrapper, 4);
        });

        it("renders all labels even when floating point approx would cause the last one to be skipped", () => {
            // [0  0.14  0.28  0.42  0.56  0.70]
            const wrapper = renderSlider({ labelStepSize: 0.14, max: 0.7, min: 0 });
            assertLabelCount(wrapper, 6);
        });

        it("renders result of labelRenderer() in each label", () => {
            const labelRenderer = (val: number) => val + "#";
            const wrapper = renderSlider({ labelRenderer, labelStepSize: 10, max: 50, min: 0 });
            assert.strictEqual(wrapper.find(`.${Classes.SLIDER}-axis`).text(), "0#10#20#30#40#50#");
        });

        it("renders result of labelRenderer() in each label with labelValues", () => {
            const labelRenderer = (val: number) => val + "#";
            const wrapper = renderSlider({ labelRenderer, labelValues: [20, 40, 50], max: 50, min: 0 });
            assert.strictEqual(wrapper.find(`.${Classes.SLIDER}-axis`).text(), "20#40#50#");
        });

        it("default labelRenderer() fixes decimal places to labelPrecision", () => {
            const wrapper = renderSlider({ labelPrecision: 1, values: [0.99 / 10, 1, 1] });
            const firstHandle = wrapper.find(Handle).first();
            assert.strictEqual(firstHandle.text(), "0.1");
        });

        it("infers precision of default labelRenderer from stepSize", () => {
            const wrapper = renderSlider({ stepSize: 0.01 });
            assert.strictEqual(wrapper.state("labelPrecision"), 2);
        });

        it("labelRenderer={false} removes all labels", () => {
            const wrapper = renderSlider({ labelRenderer: false });
            assertLabelCount(wrapper, 0);
        });

        function assertLabelCount(wrapper: ReactWrapper, expected: number) {
            assert.lengthOf(wrapper.find(`.${Classes.SLIDER}-axis`).find(`.${Classes.SLIDER_LABEL}`), expected);
        }
    });

    describe("track", () => {
        let slider: ReactWrapper;
        beforeEach(() => {
            slider = mount(
                <MultiSlider defaultTrackIntent="warning">
                    <MultiSliderHandle value={3} intentBefore="primary" intentAfter="danger" />
                    <MultiSliderHandle value={5} intentBefore="primary" intentAfter="danger" />
                    <MultiSliderHandle value={7} intentBefore="primary" />
                </MultiSlider>,
                { attachTo: containerElement },
            );
        });

        it("progress bars are rendered between all handles", () => {
            // N values = N+1 track segments
            assert.lengthOf(slider.find(`.${Classes.SLIDER_PROGRESS}`), 4);
        });

        it("intentAfter beats intentBefore", () => {
            const intents = slider.find(`.${Classes.SLIDER_PROGRESS}`).map(segment => {
                const match = segment.prop("className")?.match(/-intent-(\w+)/) || [];
                return match[1];
            });
            // last segment has default intent
            assert.deepEqual(intents, ["primary", "danger", "danger", "warning"]);
        });

        it("showTrackFill=false ignores track intents", () => {
            slider.setProps({ showTrackFill: false });
            slider.find(`.${Classes.SLIDER_PROGRESS}`).map(segment => {
                // segments rendered but they nave no intent
                assert.isNull(segment.prop("className")?.match(/-intent-(\w+)/));
            });
        });

        it("track section positioning is correct", () => {
            slider = mount(
                <MultiSlider max={1}>
                    <MultiSliderHandle value={1.2e-7} intentBefore="warning" intentAfter="warning" />
                    <MultiSliderHandle value={0.2} intentBefore="danger" intentAfter="success" />
                </MultiSlider>,
            );
            const locations = slider.find(`.${Classes.SLIDER_PROGRESS}`).map(segment => {
                const match = segment.prop("style")!;
                return [match.left, match.right];
            });
            assert.deepEqual(locations, [
                ["0.00%", "100.00%"],
                ["0.00%", "80.00%"],
                ["20.00%", "0.00%"],
            ]);
        });

        it("trackStyleBefore and trackStyleAfter work as intended", () => {
            slider = mount(
                <MultiSlider>
                    <MultiSliderHandle
                        value={1}
                        trackStyleBefore={{ background: "red" }}
                        trackStyleAfter={{ background: "yellow" }}
                    />
                    <MultiSliderHandle
                        value={2}
                        trackStyleBefore={{ background: "blue" }}
                        trackStyleAfter={{ background: "purple" }}
                    />
                </MultiSlider>,
            );

            const trackBackgrounds = slider
                .find(`.${Classes.SLIDER_PROGRESS}`)
                .map(segment => segment.prop("style")?.background);

            assert.equal(trackBackgrounds[0], "red");
            assert.equal(trackBackgrounds[1], "yellow");
            assert.equal(trackBackgrounds[2], "purple");
        });
    });

    describe("validation", () => {
        it("throws an error if a child is not a slider handle", () => {
            expectPropValidationError(MultiSlider, { children: (<span>Bad</span>) as any });
        });

        it("throws error if stepSize <= 0", () => {
            [0, -10].forEach(stepSize => {
                expectPropValidationError(MultiSlider, { stepSize }, "greater than zero");
            });
        });

        it("throws error if labelStepSize <= 0", () => {
            [0, -10].forEach(labelStepSize => {
                expectPropValidationError(MultiSlider, { labelStepSize }, "greater than zero");
            });
        });

        it("throws an error if the min value is not finite", () => {
            expectPropValidationError(
                MultiSlider,
                { min: Number.NEGATIVE_INFINITY },
                "min prop must be a finite number",
            );
        });

        it("throws an error if the max value is not finite", () => {
            expectPropValidationError(
                MultiSlider,
                { max: Number.POSITIVE_INFINITY },
                "max prop must be a finite number",
            );
        });
    });

    function renderSlider(joinedProps: MultiSliderProps & { values?: [number, number, number] } = {}) {
        const { values = [0, 5, 10], ...props } = joinedProps;
        return mount(
            <MultiSlider {...props}>
                <MultiSliderHandle value={values[0]} />
                <MultiSliderHandle value={values[1]} />
                <MultiSliderHandle value={values[2]} />
            </MultiSlider>,
            { attachTo: containerElement },
        );
    }
});
