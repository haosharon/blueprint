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

import { assert } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import sinon from "sinon";

import { Classes, Slider } from "../../src";
import { Handle } from "../../src/components/slider/handle";

import { simulateMovement } from "./sliderTestUtils";

const STEP_SIZE = 20;
const TRACK_SELECTOR = `.${Classes.SLIDER_TRACK}`;

describe("<Slider>", () => {
    let containerElement: HTMLElement;

    beforeEach(() => {
        // need an element in the document for tickSize to be a real number
        containerElement = document.createElement("div");
        // default min-max is 0-10 so there are 10 steps
        containerElement.style.width = `${STEP_SIZE * 10}px`;
        document.body.appendChild(containerElement);
    });

    afterEach(() => containerElement.remove());

    it("renders one interactive <Handle>", () => {
        const handles = renderSlider(<Slider />).find(Handle);
        assert.lengthOf(handles, 1);
    });

    it("renders primary track segment between initialValue and value", () => {
        const tracks = renderSlider(<Slider showTrackFill={true} initialValue={2} value={5} />).find(
            `.${Classes.SLIDER_PROGRESS}.${Classes.INTENT_PRIMARY}`,
        );
        assert.lengthOf(tracks, 1);
        assert.equal(tracks.getDOMNode().getBoundingClientRect().width, STEP_SIZE * 3);
    });

    it("renders primary track segment between initialValue and value when value is less than initial value", () => {
        const tracks = renderSlider(<Slider showTrackFill={true} initialValue={5} value={2} />).find(
            `.${Classes.SLIDER_PROGRESS}.${Classes.INTENT_PRIMARY}`,
        );
        assert.lengthOf(tracks, 1);
        assert.equal(tracks.getDOMNode().getBoundingClientRect().width, STEP_SIZE * 3);
    });

    it("renders no primary track segment when value equals initial value", () => {
        const tracks = renderSlider(<Slider showTrackFill={true} initialValue={2} value={2} min={0} max={5} />).find(
            `.${Classes.SLIDER_PROGRESS}.${Classes.INTENT_PRIMARY}`,
        );
        assert.lengthOf(tracks, 0);
    });

    it("renders result of labelRenderer() in each label and differently in handle", () => {
        const labelRenderer = (val: number, opts?: { isHandleTooltip: boolean }) =>
            val + (opts?.isHandleTooltip ? "!" : "#");
        const wrapper = renderSlider(
            <Slider min={0} max={50} value={10} labelStepSize={10} labelRenderer={labelRenderer} />,
        );
        assert.strictEqual(wrapper.find(`.${Classes.SLIDER}-axis`).text(), "0#10#20#30#40#50#");
        assert.strictEqual(wrapper.find(`.${Classes.SLIDER_HANDLE}`).find(`.${Classes.SLIDER_LABEL}`).text(), "10!");
    });

    it("moving mouse calls onChange with nearest value", () => {
        const changeSpy = sinon.spy();
        simulateMovement(renderSlider(<Slider onChange={changeSpy} />), {
            dragSize: STEP_SIZE,
            dragTimes: 4,
        });
        // called 4 times, for the move to 1, 2, 3, and 4
        assert.equal(changeSpy.callCount, 4, "call count");
        assert.deepEqual(changeSpy.args, [[1], [2], [3], [4]]);
    });

    it("releasing mouse calls onRelease with nearest value", () => {
        const releaseSpy = sinon.spy();
        simulateMovement(renderSlider(<Slider onRelease={releaseSpy} />), {
            dragSize: STEP_SIZE,
            dragTimes: 1,
        });
        assert.isTrue(releaseSpy.calledOnce, "onRelease not called exactly once");
        assert.equal(releaseSpy.args[0][0], 1);
    });

    it("disabled slider never invokes event handlers", () => {
        const eventSpy = sinon.spy();
        const slider = renderSlider(<Slider disabled={true} onChange={eventSpy} onRelease={eventSpy} />);
        // handle drag and keys
        simulateMovement(slider, { dragTimes: 3 });
        slider.simulate("keydown", { key: "ArrowUp" });
        // track click
        slider.find(TRACK_SELECTOR).simulate("mousedown", { target: containerElement.querySelector(TRACK_SELECTOR) });
        assert.isTrue(eventSpy.notCalled);
    });

    function renderSlider(slider: React.JSX.Element) {
        return mount(slider, { attachTo: containerElement });
    }
});
