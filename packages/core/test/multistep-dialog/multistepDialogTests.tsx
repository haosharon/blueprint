/*
 * Copyright 2020 Palantir Technologies, Inc. All rights reserved.
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

import { dispatchTestKeyboardEvent } from "@blueprintjs/test-commons";

import { AnchorButton, Classes, DialogStep, MultistepDialog } from "../../src";

// TODO: button selectors in these tests should not be tied so closely to implementation; we shouldn't
// need to reference AnchorButton directly
const findButtonWithText = (wrapper: ReactWrapper, text: string) => wrapper.find(AnchorButton).find(`[text='${text}']`);

describe("<MultistepDialog>", () => {
    it("renders its content correctly", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
            </MultistepDialog>,
        );
        [
            Classes.DIALOG,
            Classes.MULTISTEP_DIALOG_PANELS,
            Classes.MULTISTEP_DIALOG_LEFT_PANEL,
            Classes.MULTISTEP_DIALOG_RIGHT_PANEL,
            Classes.DIALOG_STEP,
            Classes.DIALOG_STEP_CONTAINER,
            Classes.DIALOG_STEP_ICON,
            Classes.DIALOG_STEP_TITLE,
            Classes.DIALOG_FOOTER_ACTIONS,
        ].forEach(className => {
            assert.lengthOf(dialog.find(`.${className}`).hostNodes(), 1, `missing ${className}`);
        });
        dialog.unmount();
    });

    it("initially selected step is first step", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        const steps = dialog.find(`.${Classes.DIALOG_STEP_CONTAINER}`);
        assert.lengthOf(steps.at(0).find(`.${Classes.ACTIVE}`), 1);
        assert.lengthOf(steps.at(1).find(`.${Classes.ACTIVE}`), 0);
        dialog.unmount();
    });

    it("clicking next should move to the next step", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        const steps = dialog.find(`.${Classes.DIALOG_STEP_CONTAINER}`);
        assert.lengthOf(steps.at(0).find(`.${Classes.DIALOG_STEP_VIEWED}`), 1);
        assert.lengthOf(steps.at(1).find(`.${Classes.ACTIVE}`), 1);
        dialog.unmount();
    });

    it("clicking back should move to the prev step", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );

        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        const steps = dialog.find(`.${Classes.DIALOG_STEP_CONTAINER}`);
        assert.lengthOf(steps.at(0).find(`.${Classes.DIALOG_STEP_VIEWED}`), 1);
        assert.lengthOf(steps.at(1).find(`.${Classes.ACTIVE}`), 1);

        findButtonWithText(dialog, "Back").simulate("click");
        const newSteps = dialog.find(`.${Classes.DIALOG_STEP_CONTAINER}`);
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        assert.lengthOf(newSteps.at(0).find(`.${Classes.ACTIVE}`), 1);
        assert.lengthOf(newSteps.at(1).find(`.${Classes.DIALOG_STEP_VIEWED}`), 1);
        dialog.unmount();
    });

    it("footer on last step of multiple steps should contain back and submit buttons", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        assert.lengthOf(findButtonWithText(dialog, "Back"), 1);
        assert.lengthOf(findButtonWithText(dialog, "Next"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Submit"), 1);
        dialog.unmount();
    });

    it("footer on first step of multiple steps should contain next button only", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );

        assert.strictEqual(dialog.state("selectedIndex"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Back"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Next"), 1);
        assert.lengthOf(findButtonWithText(dialog, "Submit"), 0);
        dialog.unmount();
    });

    it("footer on first step of single step should contain submit button only", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
            </MultistepDialog>,
        );

        assert.strictEqual(dialog.state("selectedIndex"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Back"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Next"), 0);
        assert.lengthOf(findButtonWithText(dialog, "Submit"), 1);
        dialog.unmount();
    });

    it("selecting older step should leave already viewed steps active", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        const step = dialog.find(`.${Classes.DIALOG_STEP}`);
        step.at(0).simulate("click");
        const steps = dialog.find(`.${Classes.DIALOG_STEP_CONTAINER}`);
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        assert.lengthOf(steps.at(0).find(`.${Classes.ACTIVE}`), 1);
        assert.lengthOf(steps.at(1).find(`.${Classes.DIALOG_STEP_VIEWED}`), 1);
        dialog.unmount();
    });

    it("pressing enter on older step takes effect", () => {
        const containerElement = document.createElement("div");
        document.documentElement.appendChild(containerElement);
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
            { attachTo: containerElement },
        );
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        const step = dialog.find(`.${Classes.DIALOG_STEP}`);
        step.at(0).simulate("focus");
        React.act(() => {
            dispatchTestKeyboardEvent(step.at(0).getDOMNode(), "keydown", "Enter");
        });
        assert.strictEqual(dialog.state("selectedIndex"), 0);
        dialog.unmount();
        containerElement.remove();
    });

    it("gets by without children", () => {
        assert.doesNotThrow(() => {
            const dialog = mount(<MultistepDialog isOpen={true} />);
            dialog.unmount();
        });
    });

    it("supports non-existent children", () => {
        assert.doesNotThrow(() => {
            const dialog = mount(
                <MultistepDialog>
                    {null}
                    <DialogStep id="one" panel={<Panel />} />
                    {undefined}
                    <DialogStep id="two" panel={<Panel />} />
                </MultistepDialog>,
            );
            dialog.unmount();
        });
    });

    it("enables next by default", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        assert.isUndefined(findButtonWithText(dialog, "Next").prop("disabled"));
        dialog.unmount();
    });

    it("disables next if disabled on nextButtonProps is set to true", () => {
        const dialog = mount(
            <MultistepDialog nextButtonProps={{ disabled: true }} isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} />
            </MultistepDialog>,
        );
        assert.isTrue(findButtonWithText(dialog, "Next").prop("disabled"));
        dialog.unmount();
    });

    it("disables next for second step when disabled on nextButtonProps is set to true", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} nextButtonProps={{ disabled: true }} />
                <DialogStep id="three" title="Step 3" panel={<Panel />} />
            </MultistepDialog>,
        );

        assert.strictEqual(dialog.state("selectedIndex"), 0);
        assert.isUndefined(findButtonWithText(dialog, "Next").prop("disabled"));
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        assert.isTrue(findButtonWithText(dialog, "Next").prop("disabled"));
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        dialog.unmount();
    });

    it("disables back for second step when disabled on backButtonProps is set to true", () => {
        const dialog = mount(
            <MultistepDialog isOpen={true} usePortal={false}>
                <DialogStep id="one" title="Step 1" panel={<Panel />} />
                <DialogStep id="two" title="Step 2" panel={<Panel />} backButtonProps={{ disabled: true }} />
                <DialogStep id="three" title="Step 3" panel={<Panel />} />
            </MultistepDialog>,
        );

        assert.strictEqual(dialog.state("selectedIndex"), 0);
        findButtonWithText(dialog, "Next").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        assert.isTrue(findButtonWithText(dialog, "Back").prop("disabled"));
        findButtonWithText(dialog, "Back").simulate("click");
        assert.strictEqual(dialog.state("selectedIndex"), 1);
        dialog.unmount();
    });
});

const Panel: React.FC = () => <strong> panel</strong>;
