/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
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
import * as TestUtils from "react-dom/test-utils";
import sinon from "sinon";

import { Classes as CoreClasses, Intent } from "@blueprintjs/core";
import { assertTimeIs, createTimeObject } from "@blueprintjs/test-commons";

import { Classes, TimePicker, type TimePickerProps, TimePrecision } from "../../src";

describe("<TimePicker>", () => {
    let containerElement: HTMLElement;
    let timePicker: TimePicker;
    let onTimePickerChange: sinon.SinonSpy;
    const zeroDate = new Date(0, 0, 0, 0, 0, 0, 0);

    beforeEach(() => {
        onTimePickerChange = sinon.spy();

        // this is essentially what TestUtils.renderIntoDocument does
        containerElement = document.createElement("div");
        document.documentElement.appendChild(containerElement);
    });

    afterEach(() => {
        containerElement.remove();
    });

    it("renders its contents", () => {
        assert.lengthOf(document.getElementsByClassName(Classes.TIMEPICKER), 0);

        renderTimePicker();
        assert.lengthOf(document.getElementsByClassName(Classes.TIMEPICKER), 1);
    });

    it("propagates class names correctly", () => {
        const selector = `.${Classes.TIMEPICKER}.foo`;
        assert.lengthOf(document.querySelectorAll(selector), 0);

        renderTimePicker({ className: "foo" });
        assert.lengthOf(document.querySelectorAll(selector), 1);
    });

    it("arrow buttons allow looping", () => {
        renderTimePicker({
            defaultValue: new Date(2015, 1, 1, 0, 0, 59, 999),
            precision: TimePrecision.MILLISECOND,
            showArrowButtons: true,
        });

        assertTimeIs(timePicker.state.value, 0, 0, 59, 999);
        clickDecrementBtn(Classes.TIMEPICKER_HOUR);
        assertTimeIs(timePicker.state.value, 23, 0, 59, 999);
        clickDecrementBtn(Classes.TIMEPICKER_MINUTE);
        assertTimeIs(timePicker.state.value, 23, 59, 59, 999);
        clickIncrementBtn(Classes.TIMEPICKER_SECOND);
        assertTimeIs(timePicker.state.value, 23, 59, 0, 999);
        clickIncrementBtn(Classes.TIMEPICKER_MILLISECOND);
        assertTimeIs(timePicker.state.value, 23, 59, 0, 0);
    });

    it("allows valid text entry", () => {
        renderTimePicker();
        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.strictEqual(hourInput.value, "0");
    });

    it("shows the proper number of input fields", () => {
        renderTimePicker({ precision: TimePrecision.MILLISECOND });
        assert.lengthOf(document.getElementsByClassName(Classes.TIMEPICKER_INPUT), 4);
    });

    it("all keyboard arrow presses work", () => {
        renderTimePicker({ precision: TimePrecision.MILLISECOND });

        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_HOUR, "ArrowUp");
        assertTimeIs(timePicker.state.value, 1, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_MINUTE, "ArrowUp");
        assertTimeIs(timePicker.state.value, 1, 1, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_SECOND, "ArrowUp");
        assertTimeIs(timePicker.state.value, 1, 1, 1, 0);
        keyDownOnInput(Classes.TIMEPICKER_MILLISECOND, "ArrowUp");
        assertTimeIs(timePicker.state.value, 1, 1, 1, 1);

        keyDownOnInput(Classes.TIMEPICKER_HOUR, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 1, 1, 1);
        keyDownOnInput(Classes.TIMEPICKER_MINUTE, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 1, 1);
        keyDownOnInput(Classes.TIMEPICKER_SECOND, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 1);
        keyDownOnInput(Classes.TIMEPICKER_MILLISECOND, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
    });

    it("all arrow buttons work", () => {
        renderTimePicker({ precision: TimePrecision.MILLISECOND, showArrowButtons: true });

        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_HOUR);
        assertTimeIs(timePicker.state.value, 1, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_MINUTE);
        assertTimeIs(timePicker.state.value, 1, 1, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_SECOND);
        assertTimeIs(timePicker.state.value, 1, 1, 1, 0);
        clickIncrementBtn(Classes.TIMEPICKER_MILLISECOND);
        assertTimeIs(timePicker.state.value, 1, 1, 1, 1);

        clickDecrementBtn(Classes.TIMEPICKER_HOUR);
        assertTimeIs(timePicker.state.value, 0, 1, 1, 1);
        clickDecrementBtn(Classes.TIMEPICKER_MINUTE);
        assertTimeIs(timePicker.state.value, 0, 0, 1, 1);
        clickDecrementBtn(Classes.TIMEPICKER_SECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 1);
        clickDecrementBtn(Classes.TIMEPICKER_MILLISECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
    });

    it("allows valid text entry", () => {
        renderTimePicker();
        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.strictEqual(hourInput?.value, "0");

        hourInput.value = "2";
        React.act(() => TestUtils.Simulate.change(hourInput));
        assert.strictEqual(hourInput.value, "2");
        assert.isFalse(hourInput.classList.contains(CoreClasses.intentClass(Intent.DANGER)));
    });

    it("disallows non-number text entry", () => {
        renderTimePicker();
        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.strictEqual(hourInput.value, "0");

        hourInput.value = "ab";
        React.act(() => TestUtils.Simulate.change(hourInput));
        assert.strictEqual(hourInput.value, "");
    });

    it("allows invalid number entry, but shows visual indicator", () => {
        renderTimePicker();
        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.strictEqual(hourInput.value, "0");

        hourInput.value = "300";
        React.act(() => TestUtils.Simulate.change(hourInput));
        assert.strictEqual(hourInput.value, "300");
        assert.isTrue(hourInput.classList.contains(CoreClasses.intentClass(Intent.DANGER)));
    });

    it("reverts to saved value after invalid text entry is blurred", () => {
        renderTimePicker();
        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.strictEqual(hourInput.value, "0");

        hourInput.value = "ab";
        React.act(() => TestUtils.Simulate.change(hourInput));
        React.act(() => TestUtils.Simulate.blur(hourInput));
        assert.strictEqual(hourInput.value, "0");
    });

    it("arrows are not rendered by default", () => {
        renderTimePicker();
        assert.lengthOf(document.getElementsByClassName(Classes.TIMEPICKER_ARROW_BUTTON), 0);
    });

    it("arrows are rendered when showArrowButtons is true", () => {
        renderTimePicker({ showArrowButtons: true });
        assert.lengthOf(document.getElementsByClassName(Classes.TIMEPICKER_ARROW_BUTTON), 4);
    });

    it("text is selected on focus when selectOnFocus is true", () => {
        renderTimePicker({ selectAllOnFocus: true });

        focusOnInput(Classes.TIMEPICKER_HOUR);
        assert.equal(window.getSelection()?.toString(), "0");

        focusOnInput(Classes.TIMEPICKER_MINUTE);
        assert.equal(window.getSelection()?.toString(), "00");
    });

    it("value doesn't change when disabled", () => {
        renderTimePicker({
            disabled: true,
            precision: TimePrecision.MILLISECOND,
            showArrowButtons: true,
        });

        const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
        assert.isTrue(hourInput.disabled);
        const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
        assert.isTrue(minuteInput.disabled);

        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_HOUR);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_MINUTE);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_SECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickIncrementBtn(Classes.TIMEPICKER_MILLISECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);

        clickDecrementBtn(Classes.TIMEPICKER_HOUR);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickDecrementBtn(Classes.TIMEPICKER_MINUTE);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickDecrementBtn(Classes.TIMEPICKER_SECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        clickDecrementBtn(Classes.TIMEPICKER_MILLISECOND);
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);

        keyDownOnInput(Classes.TIMEPICKER_HOUR, "ArrowUp");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_MINUTE, "ArrowUp");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_SECOND, "ArrowUp");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_MILLISECOND, "ArrowUp");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);

        keyDownOnInput(Classes.TIMEPICKER_HOUR, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_MINUTE, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_SECOND, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
        keyDownOnInput(Classes.TIMEPICKER_MILLISECOND, "ArrowDown");
        assertTimeIs(timePicker.state.value, 0, 0, 0, 0);
    });

    describe("Time range - minTime and maxTime props", () => {
        it("if defaultValue is smaller than minTime, minTime becomes initial time", () => {
            renderTimePicker({
                defaultValue: createTimeObject(12, 30),
                minTime: createTimeObject(15, 30),
                precision: TimePrecision.MILLISECOND,
            });

            assertTimeIs(timePicker.state.value, 15, 30, 0, 0);
        });

        it("if defaultValue is greater than maxTime, maxTime becomes initial time", () => {
            renderTimePicker({
                defaultValue: createTimeObject(20, 30),
                maxTime: createTimeObject(18, 30),
                minTime: createTimeObject(15, 30),
                precision: TimePrecision.MILLISECOND,
            });

            assertTimeIs(timePicker.state.value, 18, 30, 0, 0);
        });

        it("by default, any time can be selected", () => {
            renderTimePicker({
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            const secondInput = findInputElement(Classes.TIMEPICKER_SECOND);
            const millisecondInput = findInputElement(Classes.TIMEPICKER_MILLISECOND);

            /* select default minTime */
            changeInputThenBlur(hourInput, "0");
            changeInputThenBlur(minuteInput, "0");
            changeInputThenBlur(secondInput, "0");
            changeInputThenBlur(millisecondInput, "0");

            assertTimeIs(timePicker.state.value, 0, 0, 0, 0);

            /* select time between default minTime and default maxTime */
            changeInputThenBlur(hourInput, "12");
            changeInputThenBlur(minuteInput, "30");
            changeInputThenBlur(secondInput, "30");
            changeInputThenBlur(millisecondInput, "500");

            assertTimeIs(timePicker.state.value, 12, 30, 30, 500);

            /* select default maxTime */
            changeInputThenBlur(hourInput, "23");
            changeInputThenBlur(minuteInput, "59");
            changeInputThenBlur(secondInput, "59");
            changeInputThenBlur(millisecondInput, "999");

            assertTimeIs(timePicker.state.value, 23, 59, 59, 999);
        });

        it("time range allows overlapping", () => {
            renderTimePicker({
                maxTime: createTimeObject(3),
                minTime: createTimeObject(22),
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            changeInputThenBlur(hourInput, "2");
            assertTimeIs(timePicker.state.value, 2, 0, 0, 0);
        });

        it("can not type time greater than maxTime", () => {
            const defaultValue = createTimeObject(10, 20);
            const wrapper = mount(<TimePicker defaultValue={defaultValue} precision={TimePrecision.MILLISECOND} />);

            wrapper.setProps({
                maxTime: createTimeObject(21),
                minTime: createTimeObject(18),
            });

            const hourInput = wrapper
                .find(`.${Classes.TIMEPICKER_INPUT}.${Classes.TIMEPICKER_HOUR}`)
                .getDOMNode<HTMLInputElement>();

            changeInputThenBlur(hourInput, "22");

            assert.strictEqual(hourInput.getAttribute("value"), "18");
        });

        it("can not type time smaller than minTime", () => {
            const defaultValue = createTimeObject(10, 20);
            const wrapper = mount(<TimePicker defaultValue={defaultValue} precision={TimePrecision.MILLISECOND} />);

            wrapper.setProps({
                maxTime: createTimeObject(21),
                minTime: createTimeObject(18),
            });

            const hourInput = wrapper
                .find(`.${Classes.TIMEPICKER_INPUT}.${Classes.TIMEPICKER_HOUR}`)
                .getDOMNode<HTMLInputElement>();

            changeInputThenBlur(hourInput, "16");

            assert.strictEqual(hourInput.getAttribute("value"), "18");
        });

        it("time can't be smaller minTime, while decrementing unit", () => {
            renderTimePicker({
                minTime: createTimeObject(15, 32, 20, 600),
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            const secondInput = findInputElement(Classes.TIMEPICKER_SECOND);
            const millisecondInput = findInputElement(Classes.TIMEPICKER_MILLISECOND);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowDown" }));
            React.act(() => TestUtils.Simulate.keyDown(minuteInput, { key: "ArrowDown" }));
            React.act(() => TestUtils.Simulate.keyDown(secondInput, { key: "ArrowDown" }));
            React.act(() => TestUtils.Simulate.keyDown(millisecondInput, { key: "ArrowDown" }));

            assertTimeIs(timePicker.state.value, 15, 32, 20, 600);
        });

        it("time can't be greater maxTime, while incrementing unit", () => {
            renderTimePicker({
                defaultValue: createTimeObject(14, 55, 30, 200),
                maxTime: createTimeObject(14, 55, 30, 200),
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            const secondInput = findInputElement(Classes.TIMEPICKER_SECOND);
            const millisecondInput = findInputElement(Classes.TIMEPICKER_MILLISECOND);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            React.act(() => TestUtils.Simulate.keyDown(minuteInput, { key: "ArrowUp" }));
            React.act(() => TestUtils.Simulate.keyDown(secondInput, { key: "ArrowUp" }));
            React.act(() => TestUtils.Simulate.keyDown(millisecondInput, { key: "ArrowUp" }));

            assertTimeIs(timePicker.state.value, 14, 55, 30, 200);
        });

        it("when selected time is smaller than minTime, after blur, time should be reset to last good state", () => {
            renderTimePicker({
                defaultValue: createTimeObject(15, 32, 20, 600),
                minTime: createTimeObject(15, 32, 20, 600),
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            const secondInput = findInputElement(Classes.TIMEPICKER_SECOND);
            const millisecondsInput = findInputElement(Classes.TIMEPICKER_MILLISECOND);

            changeInputThenBlur(hourInput, "14");
            changeInputThenBlur(minuteInput, "31");
            changeInputThenBlur(secondInput, "19");
            changeInputThenBlur(millisecondsInput, "500");

            assertTimeIs(timePicker.state.value, 15, 32, 20, 600);
        });

        it("when selected time is greater than maxTime, after blur, time should be reset to last good state", () => {
            renderTimePicker({
                defaultValue: createTimeObject(15, 32, 20, 600),
                maxTime: createTimeObject(15, 32, 20, 600),
                precision: TimePrecision.MILLISECOND,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            const secondInput = findInputElement(Classes.TIMEPICKER_SECOND);
            const millisecondsInput = findInputElement(Classes.TIMEPICKER_MILLISECOND);

            changeInputThenBlur(hourInput, "16");
            changeInputThenBlur(minuteInput, "33");
            changeInputThenBlur(secondInput, "21");
            changeInputThenBlur(millisecondsInput, "700");

            assertTimeIs(timePicker.state.value, 15, 32, 20, 600);
        });

        it("when minTime prop change, selected time immediately adjust to new range", () => {
            const defaultValue = createTimeObject(10, 20);
            const wrapper = mount<TimePicker>(
                <TimePicker defaultValue={defaultValue} precision={TimePrecision.MILLISECOND} />,
            );

            wrapper.setProps({ minTime: createTimeObject(15, 32, 20, 600) });

            assertTimeIs(wrapper.state().value, 15, 32, 20, 600);
        });

        it("when maxTime prop change, selected time immediately adjust to new range", () => {
            const defaultValue = createTimeObject(12, 20);
            const wrapper = mount<TimePicker>(
                <TimePicker defaultValue={defaultValue} precision={TimePrecision.MILLISECOND} />,
            );

            wrapper.setProps({ maxTime: createTimeObject(10, 30, 15, 200) });

            assertTimeIs(wrapper.state().value, 10, 30, 15, 200);
        });

        it("when minTime === maxTime, selected time should be the very value to which both boundaries are set", () => {
            renderTimePicker({
                maxTime: createTimeObject(14, 15),
                minTime: createTimeObject(14, 15),
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assertTimeIs(timePicker.state.value, 14, 15);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowDown" }));
            assertTimeIs(timePicker.state.value, 14, 15);
        });

        it("time doesn't loop when minTime > maxTime and selected time exceeds minTime", () => {
            const minTime = createTimeObject(17, 20);
            renderTimePicker({
                defaultValue: minTime,
                maxTime: createTimeObject(15, 20),
                minTime,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowDown" }));
            assertTimeIs(timePicker.state.value, 17, 20);
        });

        it("time doesn't loop when minTime > maxTime and selected time exceeds maxTime", () => {
            const maxTime = createTimeObject(12, 20);
            renderTimePicker({
                defaultValue: maxTime,
                maxTime,
                minTime: createTimeObject(17, 20),
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assertTimeIs(timePicker.state.value, 12, 20);
        });

        it("time doesn't loop when minTime < maxTime and selected time exceeds maxTime", () => {
            const maxTime = createTimeObject(17, 20);
            renderTimePicker({
                defaultValue: maxTime,
                maxTime,
                minTime: createTimeObject(12, 20),
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assertTimeIs(timePicker.state.value, 17, 20);
        });

        it("time doesn't loop when minTime < maxTime and selected time exceeds minTime", () => {
            const minTime = createTimeObject(12, 20);
            renderTimePicker({
                defaultValue: minTime,
                maxTime: createTimeObject(17, 20),
                minTime,
            });

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowDown" }));
            assertTimeIs(timePicker.state.value, 12, 20);
        });
    });

    describe("when uncontrolled", () => {
        it("defaultValue sets the initialTime", () => {
            renderTimePicker({
                defaultValue: new Date(2015, 1, 1, 10, 11, 12, 13),
                precision: TimePrecision.MILLISECOND,
            });
            const { value } = timePicker.state;
            assert.strictEqual(value?.getHours(), 10);
            assert.strictEqual(value?.getMinutes(), 11);
            assert.strictEqual(value?.getSeconds(), 12);
            assert.strictEqual(value?.getMilliseconds(), 13);
        });

        it("should fire onChange events on up-arrow key down", () => {
            renderTimePicker();
            assert.isTrue(onTimePickerChange.notCalled);

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.isTrue((onTimePickerChange.firstCall.args[0] as Date).getHours() === 1);
        });

        it("should change input text and state value on up-arrow key down", () => {
            renderTimePicker();
            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assert.strictEqual(hourInput.value, "1");
            assert.strictEqual(timePicker.state.value?.getHours(), 1);
        });

        it("should fire onChange events when new value is typed in", () => {
            renderTimePicker();
            assert.isTrue(onTimePickerChange.notCalled);
            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            hourInput.value = "8";
            React.act(() => TestUtils.Simulate.change(hourInput));
            React.act(() => TestUtils.Simulate.blur(hourInput));
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.strictEqual((onTimePickerChange.firstCall.args[0] as Date).getHours(), 8);
        });

        it("should format input and change state value when new value is typed in", () => {
            renderTimePicker();
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            assert.strictEqual(minuteInput.value, "00");
            assert.strictEqual(timePicker.state.value?.getMinutes(), 0);

            minuteInput.value = "8";
            React.act(() => TestUtils.Simulate.change(minuteInput));
            React.act(() => TestUtils.Simulate.blur(minuteInput));
            assert.strictEqual(minuteInput.value, "08");
            assert.strictEqual(timePicker.state.value?.getMinutes(), 8);
        });

        it("should fire onChange events when arrow button is pressed", () => {
            renderTimePicker({ showArrowButtons: true });
            assert.isTrue(onTimePickerChange.notCalled);

            clickIncrementBtn(Classes.TIMEPICKER_HOUR);
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.strictEqual((onTimePickerChange.firstCall.args[0] as Date).getHours(), 1);
        });

        it("should change input and state value when arrow button is pressed", () => {
            renderTimePicker({ showArrowButtons: true });
            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);

            clickIncrementBtn(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "1");
            assert.strictEqual(timePicker.state.value?.getHours(), 1);
        });
    });

    describe("when controlled", () => {
        it("changing value changes state", () => {
            renderTimePicker({ value: zeroDate });
            let { value } = timePicker.state;
            assert.strictEqual(value?.getHours(), 0);
            assert.strictEqual(value?.getMinutes(), 0);
            assert.strictEqual(value?.getSeconds(), 0);
            assert.strictEqual(value?.getMilliseconds(), 0);

            renderTimePicker({ value: new Date(2015, 1, 1, 1, 2, 3, 4) });
            value = timePicker.state.value;
            assert.strictEqual(value?.getHours(), 1);
            assert.strictEqual(value?.getMinutes(), 2);
            assert.strictEqual(value?.getSeconds(), 3);
            assert.strictEqual(value?.getMilliseconds(), 4);
        });

        it("changing value to null resets state", () => {
            const root = mount<TimePicker>(<TimePicker defaultValue={new Date(2015, 1, 1, 1, 2, 3, 4)} />);

            const initialValue = root.state("value");
            assert.strictEqual(initialValue?.getHours(), 1);
            assert.strictEqual(initialValue?.getMinutes(), 2);
            assert.strictEqual(initialValue?.getSeconds(), 3);
            assert.strictEqual(initialValue?.getMilliseconds(), 4);

            root.setProps({ value: new Date(2015, 1, 1, 5, 6, 7, 8) });

            const updatedValue = root.state("value");
            assert.strictEqual(updatedValue?.getHours(), 5);
            assert.strictEqual(updatedValue?.getMinutes(), 6);
            assert.strictEqual(updatedValue?.getSeconds(), 7);
            assert.strictEqual(updatedValue?.getMilliseconds(), 8);

            root.setProps({ value: null });

            const resetValue = root.state("value");
            assert.strictEqual(resetValue?.getHours(), 1);
            assert.strictEqual(resetValue?.getMinutes(), 2);
            assert.strictEqual(resetValue?.getSeconds(), 3);
            assert.strictEqual(resetValue?.getMilliseconds(), 4);
        });

        it("should fire onChange events on up-arrow key down", () => {
            renderTimePicker({ value: zeroDate });
            assert.isTrue(onTimePickerChange.notCalled);

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.strictEqual((onTimePickerChange.firstCall.args[0] as Date).getHours(), 1);
        });

        it("should not change input text or state value on up-arrow key down", () => {
            renderTimePicker({ value: zeroDate });
            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);

            React.act(() => TestUtils.Simulate.keyDown(hourInput, { key: "ArrowUp" }));
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);
        });

        it("should fire onChange events when new value is typed in", () => {
            renderTimePicker({ value: zeroDate });
            assert.isTrue(onTimePickerChange.notCalled);

            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            hourInput.value = "8";
            React.act(() => TestUtils.Simulate.change(hourInput));
            React.act(() => TestUtils.Simulate.blur(hourInput));
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.strictEqual((onTimePickerChange.firstCall.args[0] as Date).getHours(), 8);
        });

        it("should not format input and change state value when new value is typed in", () => {
            renderTimePicker({ value: zeroDate });
            const minuteInput = findInputElement(Classes.TIMEPICKER_MINUTE);
            assert.strictEqual(minuteInput.value, "00");
            assert.strictEqual(timePicker.state.value?.getMinutes(), 0);

            minuteInput.value = "8";
            React.act(() => TestUtils.Simulate.change(minuteInput));
            React.act(() => TestUtils.Simulate.blur(minuteInput));
            assert.strictEqual(minuteInput.value, "00");
            assert.strictEqual(timePicker.state.value?.getMinutes(), 0);
        });

        it("should fire onChange events when arrow button is pressed", () => {
            renderTimePicker({ showArrowButtons: true, value: zeroDate });
            assert.isTrue(onTimePickerChange.notCalled);

            clickIncrementBtn(Classes.TIMEPICKER_HOUR);
            assert.isTrue(onTimePickerChange.calledOnce);
            assert.strictEqual((onTimePickerChange.firstCall.args[0] as Date).getHours(), 1);
        });

        it("should not change input and state value when arrow button is pressed", () => {
            renderTimePicker({ showArrowButtons: true, value: zeroDate });
            const hourInput = findInputElement(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);

            clickIncrementBtn(Classes.TIMEPICKER_HOUR);
            assert.strictEqual(hourInput.value, "0");
            assert.strictEqual(timePicker.state.value?.getHours(), 0);
        });
    });

    function clickIncrementBtn(className: string) {
        const arrowBtns = document.querySelectorAll(`.${Classes.TIMEPICKER_ARROW_BUTTON}.${className}`);
        React.act(() => TestUtils.Simulate.click(arrowBtns[0]));
    }

    function clickDecrementBtn(className: string) {
        const arrowBtns = document.querySelectorAll(`.${Classes.TIMEPICKER_ARROW_BUTTON}.${className}`);
        React.act(() => TestUtils.Simulate.click(arrowBtns[1]));
    }

    function focusOnInput(className: string) {
        React.act(() => TestUtils.Simulate.focus(findInputElement(className)));
    }

    function keyDownOnInput(className: string, key: string) {
        React.act(() => TestUtils.Simulate.keyDown(findInputElement(className), { key }));
    }

    function findInputElement(className: string): HTMLInputElement {
        return (
            document.querySelector<HTMLInputElement>(`.${Classes.TIMEPICKER_INPUT}.${className}`) ??
            document.createElement("input")
        );
    }

    function changeInputThenBlur(input: HTMLInputElement, value: string) {
        input.value = value;
        React.act(() => TestUtils.Simulate.change(input));
        React.act(() => TestUtils.Simulate.blur(input));
    }

    function renderTimePicker(props?: Partial<TimePickerProps>) {
        const wrapper = mount(<TimePicker onChange={onTimePickerChange} {...props} />, { attachTo: containerElement });

        timePicker = wrapper.instance() as TimePicker;
    }
});
