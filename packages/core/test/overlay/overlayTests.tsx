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

/**
 * @fileoverview This component is DEPRECATED, and the code is frozen.
 * All changes & bugfixes should be made to Overlay2 instead.
 */

/* eslint-disable @typescript-eslint/no-deprecated */

import { waitFor } from "@testing-library/dom";
import { assert } from "chai";
import { mount, type ReactWrapper, shallow } from "enzyme";
import * as React from "react";
import { spy } from "sinon";

import { dispatchMouseEvent } from "@blueprintjs/test-commons";

import { Classes, Overlay, type OverlayProps, Portal, Utils } from "../../src";
import { findInPortal, sleep } from "../utils";

const BACKDROP_SELECTOR = `.${Classes.OVERLAY_BACKDROP}`;

/*
IMPORTANT NOTE: It is critical that every <Overlay> wrapper be unmounted after the test, to avoid
polluting the DOM with leftover overlay elements. This was the cause of the Overlay test flakes of
late 2017/early 2018 and was resolved by ensuring that every wrapper is unmounted.

The `wrapper` variable below and the `mountWrapper` method should be used for full enzyme mounts.
For shallow mounts, be sure to call `shallowWrapper.unmount()` after the assertions.
*/
describe("<Overlay>", () => {
    let wrapper: ReactWrapper<OverlayProps, any>;
    let isMounted = false;
    const containerElement = document.createElement("div");
    document.documentElement.appendChild(containerElement);

    /**
     * Mount the `content` into `containerElement` and assign to local `wrapper` variable.
     * Use this method in this suite instead of Enzyme's `mount` method.
     */
    function mountWrapper(content: React.JSX.Element) {
        wrapper = mount(content, { attachTo: containerElement });
        isMounted = true;
        return wrapper;
    }

    afterEach(() => {
        if (isMounted) {
            // clean up wrapper after each test, if it was used
            wrapper?.unmount();
            wrapper?.detach();
            isMounted = false;
        }
    });

    after(() => {
        document.documentElement.removeChild(containerElement);
    });

    it("renders its content correctly", () => {
        const overlay = shallow(
            <Overlay isOpen={true} usePortal={false}>
                {createOverlayContents()}
            </Overlay>,
        );
        assert.lengthOf(overlay.find("strong"), 1);
        assert.lengthOf(overlay.find(BACKDROP_SELECTOR), 1);
        overlay.unmount();
    });

    it("renders contents to specified container correctly", () => {
        const CLASS_TO_TEST = "bp-test-content";
        const container = document.createElement("div");
        document.body.appendChild(container);
        mountWrapper(
            <Overlay isOpen={true} portalContainer={container}>
                <p className={CLASS_TO_TEST}>test</p>
            </Overlay>,
        );
        assert.lengthOf(container.getElementsByClassName(CLASS_TO_TEST), 1);
        document.body.removeChild(container);
    });

    it("sets aria-live", () => {
        // Using an open Overlay because an initially closed Overlay will not render anything to the
        // DOM
        mountWrapper(<Overlay className="aria-test" isOpen={true} usePortal={false} />);
        const overlayElement = document.querySelector(".aria-test");
        assert.exists(overlayElement);
        // Element#ariaLive not supported in Firefox or IE
        assert.equal(overlayElement?.getAttribute("aria-live"), "polite");
    });

    it("portalClassName appears on Portal", () => {
        const CLASS_TO_TEST = "bp-test-content";
        mountWrapper(
            <Overlay isOpen={true} portalClassName={CLASS_TO_TEST}>
                <p>test</p>
            </Overlay>,
        );
        // search document for portal container element.
        assert.isDefined(document.querySelector(`.${Classes.PORTAL}.${CLASS_TO_TEST}`));
    });

    it("renders Portal after first opened", () => {
        mountWrapper(<Overlay isOpen={false}>{createOverlayContents()}</Overlay>);
        assert.lengthOf(wrapper.find(Portal), 0, "unexpected Portal");
        wrapper.setProps({ isOpen: true });
        assert.lengthOf(wrapper.find(Portal), 1, "expected Portal");
    });

    it("supports non-element children", () => {
        assert.doesNotThrow(() =>
            shallow(
                <Overlay isOpen={true} usePortal={false}>
                    {null} {undefined}
                </Overlay>,
            ).unmount(),
        );
    });

    it("hasBackdrop=false does not render backdrop", () => {
        const overlay = shallow(
            <Overlay hasBackdrop={false} isOpen={true} usePortal={false}>
                {createOverlayContents()}
            </Overlay>,
        );
        assert.lengthOf(overlay.find("strong"), 1);
        assert.lengthOf(overlay.find(BACKDROP_SELECTOR), 0);
        overlay.unmount();
    });

    it("renders portal attached to body when not inline after first opened", () => {
        mountWrapper(<Overlay isOpen={false}>{createOverlayContents()}</Overlay>);
        assert.lengthOf(wrapper.find(Portal), 0, "unexpected Portal");
        wrapper.setProps({ isOpen: true });
        assert.lengthOf(wrapper.find(Portal), 1, "expected Portal");
    });

    describe("onClose", () => {
        it("invoked on backdrop mousedown when canOutsideClickClose=true", () => {
            const onClose = spy();
            const overlay = shallow(
                <Overlay canOutsideClickClose={true} isOpen={true} onClose={onClose} usePortal={false}>
                    {createOverlayContents()}
                </Overlay>,
            );
            overlay.find(BACKDROP_SELECTOR).simulate("mousedown");
            assert.isTrue(onClose.calledOnce);
            overlay.unmount();
        });

        it("not invoked on backdrop mousedown when canOutsideClickClose=false", () => {
            const onClose = spy();
            const overlay = shallow(
                <Overlay canOutsideClickClose={false} isOpen={true} onClose={onClose} usePortal={false}>
                    {createOverlayContents()}
                </Overlay>,
            );
            overlay.find(BACKDROP_SELECTOR).simulate("mousedown");
            assert.isTrue(onClose.notCalled);
            overlay.unmount();
        });

        it("invoked on document mousedown when hasBackdrop=false", () => {
            const onClose = spy();
            // mounting cuz we need document events + lifecycle
            mountWrapper(
                <Overlay hasBackdrop={false} isOpen={true} onClose={onClose} usePortal={false}>
                    {createOverlayContents()}
                </Overlay>,
            );

            dispatchMouseEvent(document.documentElement, "mousedown");
            assert.isTrue(onClose.calledOnce);
        });

        it("not invoked on document mousedown when hasBackdrop=false and canOutsideClickClose=false", () => {
            const onClose = spy();
            mountWrapper(
                <Overlay
                    canOutsideClickClose={false}
                    hasBackdrop={false}
                    isOpen={true}
                    onClose={onClose}
                    usePortal={false}
                >
                    {createOverlayContents()}
                </Overlay>,
            );

            dispatchMouseEvent(document.documentElement, "mousedown");
            assert.isTrue(onClose.notCalled);
        });

        it("not invoked on click of a nested overlay", () => {
            const onClose = spy();
            mountWrapper(
                <Overlay isOpen={true} onClose={onClose}>
                    <div id="outer-element">
                        {createOverlayContents()}
                        <Overlay isOpen={true}>
                            <div id="inner-element">{createOverlayContents()}</div>
                        </Overlay>
                    </div>
                </Overlay>,
            );
            // this hackery is necessary for React 15 support, where Portals break trees.
            findInPortal(findInPortal(wrapper, "#outer-element"), "#inner-element").simulate("mousedown");
            assert.isTrue(onClose.notCalled);
        });

        it("invoked on escape key", () => {
            const onClose = spy();
            mountWrapper(
                <Overlay isOpen={true} onClose={onClose} usePortal={false}>
                    {createOverlayContents()}
                </Overlay>,
            );
            wrapper.simulate("keydown", { key: "Escape" });
            assert.isTrue(onClose.calledOnce);
        });

        it("not invoked on escape key when canEscapeKeyClose=false", () => {
            const onClose = spy();
            const overlay = shallow(
                <Overlay canEscapeKeyClose={false} isOpen={true} onClose={onClose} usePortal={false}>
                    {createOverlayContents()}
                </Overlay>,
            );
            overlay.simulate("keydown", { key: "Escape" });
            assert.isTrue(onClose.notCalled);
            overlay.unmount();
        });

        it("renders portal attached to body when not inline", () => {
            const overlay = shallow(
                <Overlay isOpen={true} usePortal={true}>
                    {createOverlayContents()}
                </Overlay>,
            );
            const portal = overlay.find(Portal);
            assert.isTrue(portal.exists(), "missing Portal");
            assert.lengthOf(portal.find("strong"), 1, "missing h1");
            overlay.unmount();
        });
    });

    describe("Focus management", () => {
        const overlayClassName = "test-overlay";

        it("brings focus to overlay if autoFocus=true", async () => {
            mountWrapper(
                <Overlay className={overlayClassName} autoFocus={true} isOpen={true} usePortal={true}>
                    <input type="text" />
                </Overlay>,
            );
            await assertFocusIsInOverlay();
        });

        it("does not bring focus to overlay if autoFocus=false and enforceFocus=false", async () => {
            mountWrapper(
                <div>
                    <button>something outside overlay for browser to focus on</button>
                    <Overlay
                        className={overlayClassName}
                        autoFocus={false}
                        enforceFocus={false}
                        isOpen={true}
                        usePortal={true}
                    >
                        <input type="text" />
                    </Overlay>
                </div>,
            );
            await assertFocus("body");
        });

        // React implements autoFocus itself so our `[autofocus]` logic never fires.
        // Still, worth testing we can control where the focus goes.
        it("autoFocus element inside overlay gets the focus", async () => {
            mountWrapper(
                <Overlay className={overlayClassName} isOpen={true} usePortal={true}>
                    <input autoFocus={true} type="text" />
                </Overlay>,
            );
            await assertFocus("input");
        });

        it("returns focus to overlay if enforceFocus=true", async () => {
            const buttonRef = React.createRef<HTMLButtonElement>();
            const inputRef = React.createRef<HTMLInputElement>();
            mountWrapper(
                <div>
                    <button ref={buttonRef} />
                    <Overlay className={overlayClassName} enforceFocus={true} isOpen={true} usePortal={true}>
                        <input autoFocus={true} ref={inputRef} />
                    </Overlay>
                </div>,
            );
            assert.strictEqual(document.activeElement, inputRef.current);
            buttonRef.current?.focus();
            await assertFocusIsInOverlay();
        });

        it("returns focus to overlay after clicking the backdrop if enforceFocus=true", async () => {
            mountWrapper(
                <Overlay
                    className={overlayClassName}
                    enforceFocus={true}
                    canOutsideClickClose={false}
                    isOpen={true}
                    usePortal={false}
                >
                    {createOverlayContents()}
                </Overlay>,
            );
            wrapper.find(BACKDROP_SELECTOR).simulate("mousedown");
            await assertFocusIsInOverlay();
        });

        it("returns focus to overlay after clicking an outside element if enforceFocus=true", async () => {
            mountWrapper(
                <div>
                    <Overlay
                        enforceFocus={true}
                        canOutsideClickClose={false}
                        className={overlayClassName}
                        isOpen={true}
                        usePortal={false}
                        hasBackdrop={false}
                    >
                        {createOverlayContents()}
                    </Overlay>
                    <button id="buttonId" />
                </div>,
            );
            wrapper.find("#buttonId").simulate("click");
            await assertFocusIsInOverlay();
        });

        it("does not result in maximum call stack if two overlays open with enforceFocus=true", () => {
            const anotherContainer = document.createElement("div");
            document.documentElement.appendChild(anotherContainer);
            const temporaryWrapper = mount(
                <Overlay className={overlayClassName} enforceFocus={true} isOpen={true} usePortal={false}>
                    <input type="text" />
                </Overlay>,
                { attachTo: anotherContainer },
            );

            mountWrapper(
                <Overlay className={overlayClassName} enforceFocus={true} isOpen={false} usePortal={false}>
                    <input id="inputId" type="text" />
                </Overlay>,
            );
            // ES6 class property vs prototype, see: https://github.com/airbnb/enzyme/issues/365
            const bringFocusSpy = spy(wrapper.instance() as Overlay, "bringFocusInsideOverlay");
            wrapper.setProps({ isOpen: true });

            // triggers the infinite recursion
            wrapper.find("#inputId").simulate("click");
            assert.isTrue(bringFocusSpy.calledOnce);

            // don't need spy.restore() since the wrapper will be destroyed after test anyways
            temporaryWrapper.unmount();
            document.documentElement.removeChild(anotherContainer);
        });

        it("does not return focus to overlay if enforceFocus=false", () => {
            let buttonRef: HTMLElement | null;
            const focusBtnAndAssert = async () => {
                buttonRef?.focus();
                await waitFor(() => assert.strictEqual(buttonRef, document.activeElement));
            };

            mountWrapper(
                <div>
                    <button ref={ref => (buttonRef = ref)} />
                    <Overlay className={overlayClassName} enforceFocus={false} isOpen={true} usePortal={true}>
                        <input ref={ref => ref && focusBtnAndAssert()} />
                    </Overlay>
                </div>,
            );
        });

        it("doesn't focus overlay if focus is already inside overlay", async () => {
            let textarea: HTMLTextAreaElement | null;
            mountWrapper(
                <Overlay className={overlayClassName} isOpen={true} usePortal={true}>
                    <textarea ref={ref => (textarea = ref)} />
                </Overlay>,
            );
            textarea!.focus();
            await assertFocus("textarea");
        });

        it("does not focus overlay when closed", async () => {
            mountWrapper(
                <div>
                    <button ref={ref => ref && ref.focus()} />
                    <Overlay className={overlayClassName} isOpen={false} usePortal={true} />
                </div>,
            );
            await assertFocus("button");
        });

        it("does not crash while trying to return focus to overlay if user clicks outside the document", () => {
            mountWrapper(
                <Overlay
                    className={overlayClassName}
                    enforceFocus={true}
                    canOutsideClickClose={false}
                    isOpen={true}
                    usePortal={false}
                >
                    {createOverlayContents()}
                </Overlay>,
            );

            // this is a fairly custom / nonstandard event dispatch, trying to simulate what happens in some browsers when a user clicks
            // on the browser toolbar (outside the document), but a focus event is still dispatched to document
            // see https://github.com/palantir/blueprint/issues/3928
            const event = new FocusEvent("focus");
            Object.defineProperty(event, "target", { value: window });

            try {
                document.dispatchEvent(event);
            } catch (e) {
                assert.fail("threw uncaught error");
            }
        });

        async function assertFocus(selector: string | (() => void)) {
            // the behavior being tested relies on requestAnimationFrame.
            // waitFor to reduce flakes.
            await waitFor(() => {
                wrapper.update();
                if (Utils.isFunction(selector)) {
                    selector();
                } else {
                    assert.strictEqual(document.querySelector(selector), document.activeElement);
                }
            });
        }

        async function assertFocusIsInOverlay() {
            await assertFocus(() => {
                const overlayElement = document.querySelector(`.${overlayClassName}`);
                assert.isTrue(overlayElement?.contains(document.activeElement));
            });
        }
    });

    describe("Background scrolling", () => {
        beforeEach(() => {
            // force-reset Overlay stack state between tests
            (Overlay as any).openStack = [];
            document.body.classList.remove(Classes.OVERLAY_OPEN);
        });

        it("disables document scrolling by default", async () => {
            wrapper = mountWrapper(renderBackdropOverlay());
            await assertBodyScrollingDisabled(true);
        });

        it("disables document scrolling if hasBackdrop=true and usePortal=true", async () => {
            wrapper = mountWrapper(renderBackdropOverlay(true, true));
            await assertBodyScrollingDisabled(true);
        });

        it("does not disable document scrolling if hasBackdrop=true and usePortal=false", async () => {
            wrapper = mountWrapper(renderBackdropOverlay(true, false));
            await assertBodyScrollingDisabled(false);
        });

        it("does not disable document scrolling if hasBackdrop=false and usePortal=true", async () => {
            wrapper = mountWrapper(renderBackdropOverlay(false, true));
            await assertBodyScrollingDisabled(false);
        });

        it("does not disable document scrolling if hasBackdrop=false and usePortal=false", async () => {
            wrapper = mountWrapper(renderBackdropOverlay(false, false));
            await assertBodyScrollingDisabled(false);
        });

        it("keeps scrolling disabled if hasBackdrop=true overlay exists following unmount", async () => {
            const backdropOverlay = mount(renderBackdropOverlay(true));
            wrapper = mountWrapper(renderBackdropOverlay(true));
            backdropOverlay.unmount();

            await assertBodyScrollingDisabled(true);
        });

        it("doesn't keep scrolling disabled if no hasBackdrop=true overlay exists following unmount", async () => {
            const backdropOverlay = mount(renderBackdropOverlay(true));
            wrapper = mountWrapper(renderBackdropOverlay(false));
            backdropOverlay.unmount();

            await assertBodyScrollingDisabled(false);
        });

        function renderBackdropOverlay(hasBackdrop?: boolean, usePortal?: boolean) {
            return (
                <Overlay hasBackdrop={hasBackdrop} isOpen={true} usePortal={usePortal}>
                    <div>Some overlay content</div>
                </Overlay>
            );
        }

        async function assertBodyScrollingDisabled(disabled: boolean) {
            // wait for the DOM to settle before checking body classes
            await waitFor(() => {
                const hasClass = document.body.classList.contains(Classes.OVERLAY_OPEN);
                assert.equal(hasClass, disabled);
            });
        }
    });

    it.skip("lifecycle methods called as expected", async () => {
        // these lifecycles are passed directly to CSSTransition from react-transition-group
        // so we do not need to test these extensively. one integration test should do.
        const onClosed = spy();
        const onClosing = spy();
        const onOpened = spy();
        const onOpening = spy();
        wrapper = mountWrapper(
            <Overlay
                {...{ onClosed, onClosing, onOpened, onOpening }}
                isOpen={true}
                usePortal={false}
                // transition duration shorter than timeout below to ensure it's done
                transitionDuration={8}
            >
                {createOverlayContents()}
            </Overlay>,
        );
        assert.isTrue(onOpening.calledOnce, "onOpening");
        assert.isFalse(onOpened.calledOnce, "onOpened not called yet");

        await sleep(10);

        // on*ed called after transition completes
        assert.isTrue(onOpened.calledOnce, "onOpened");

        wrapper.setProps({ isOpen: false });
        // on*ing called immediately when prop changes
        assert.isTrue(onClosing.calledOnce, "onClosing");
        assert.isFalse(onClosed.calledOnce, "onClosed not called yet");

        await sleep(10);

        assert.isTrue(onClosed.calledOnce, "onOpened");
    });

    let index = 0;
    function createOverlayContents() {
        return (
            <strong id={`overlay-${index++}`} tabIndex={0}>
                Overlay content!
            </strong>
        );
    }
});
