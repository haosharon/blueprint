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

/* eslint-disable  max-classes-per-file */

import { mount, type ReactWrapper } from "enzyme";
import * as React from "react";

import { BlueprintProvider } from "@blueprintjs/core";

export type MouseEventType = "click" | "mousedown" | "mouseup" | "mousemove" | "mouseenter" | "mouseleave";
export type KeyboardEventType = "keypress" | "keydown" | "keyup";

export interface HarnessMouseOptions {
    /** @default 0 */
    offsetX?: number;

    /** @default 0 */
    offsetY?: number;

    /** @default false */
    altKey?: boolean;

    /** @default false */
    ctrlKey?: boolean;

    /** @default false */
    metaKey?: boolean;

    /** @default false */
    shiftKey?: boolean;

    /** @default 0 */
    button?: number;
}

function dispatchTestKeyboardEvent(target: EventTarget, eventType: string, key: string, modKey = false) {
    const event = document.createEvent("KeyboardEvent");
    const keyCode = key.charCodeAt(0);

    let ctrlKey = false;
    let metaKey = false;

    if (modKey) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
            metaKey = true;
        } else {
            ctrlKey = true;
        }
    }

    // HACKHACK: need to move away from custom test harness infrastructure in @blueprintjs/table package
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    event.initKeyboardEvent(eventType, true, true, window, key, 0, ctrlKey, false, false, metaKey);
    Object.defineProperty(event, "key", { get: () => key });
    Object.defineProperty(event, "which", { get: () => keyCode });

    target.dispatchEvent(event);
}

// TODO: Share with blueprint-components #27

export class ElementHarness {
    public static document() {
        return new ElementHarness(document.documentElement);
    }

    public element: Element | null;

    constructor(element: Element | null) {
        this.element = element;
    }

    public exists() {
        return this.element != null;
    }

    public find(query: string, nth?: number) {
        const element = this.findElement(query, nth);
        return new ElementHarness(element ?? null);
    }

    public hasClass(className: string) {
        return this.element?.classList.contains(className) ?? false;
    }

    public bounds() {
        return this.element?.getBoundingClientRect();
    }

    public text() {
        return this.element?.textContent;
    }

    public style() {
        return (this.element as HTMLElement | null)?.style;
    }

    public focus() {
        React.act(() => {
            (this.element as HTMLElement | null)?.focus();
        });
        return this;
    }

    public blur() {
        React.act(() => {
            (this.element as HTMLElement | null)?.blur();
        });
        return this;
    }

    public mouse(
        eventType: MouseEventType = "click",
        offsetXOrOptions: number | HarnessMouseOptions = 0, // TODO: Change all tests to the object API
        offsetY = 0,
        isMetaKeyDown = false,
        isShiftKeyDown = false,
        button: number = 0,
    ) {
        let offsetX: number;
        let isAltKeyDown: boolean = false;
        let isCtrlKeyDown: boolean = false;

        if (typeof offsetXOrOptions === "object") {
            offsetX = this.defaultValue(offsetXOrOptions.offsetX, 0);
            offsetY = this.defaultValue(offsetXOrOptions.offsetY, 0);
            isAltKeyDown = this.defaultValue(offsetXOrOptions.altKey, false);
            isCtrlKeyDown = this.defaultValue(offsetXOrOptions.ctrlKey, false);
            isMetaKeyDown = this.defaultValue(offsetXOrOptions.metaKey, false);
            isShiftKeyDown = this.defaultValue(offsetXOrOptions.shiftKey, false);
            button = this.defaultValue(offsetXOrOptions.button, 0);
        } else {
            offsetX = offsetXOrOptions as number;
        }

        const bounds = this.bounds();
        if (bounds !== undefined) {
            const x = bounds.left + bounds.width / 2 + offsetX;
            const y = bounds.top + bounds.height / 2 + offsetY;

            const event = new MouseEvent(eventType, {
                altKey: isAltKeyDown,
                bubbles: true,
                button,
                cancelable: true,
                clientX: x,
                clientY: y,
                ctrlKey: isCtrlKeyDown,
                detail: 0,
                metaKey: isMetaKeyDown,
                shiftKey: isShiftKeyDown,
                view: window,
            });
            React.act(() => {
                this.element!.dispatchEvent(event);
            });
        }
        return this;
    }

    public keyboard(eventType: KeyboardEventType = "keypress", key = "", modKey = false) {
        if (this.exists()) {
            React.act(() => {
                dispatchTestKeyboardEvent(this.element!, eventType, key, modKey);
            });
        }
        return this;
    }

    public change(value?: string) {
        if (this.exists()) {
            React.act(() => {
                if (value != null) {
                    (this.element as HTMLInputElement).value = value;
                }

                // Apparently onChange listeners are listening for "input" events.
                const event = document.createEvent("HTMLEvents");
                // HACKHACK: need to move away from custom test harness infrastructure in @blueprintjs/table package
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                event.initEvent("input", true, true);
                this.element!.dispatchEvent(event);
            });
        }
        return this;
    }

    private findElement(query: string, nth?: number) {
        if (nth != null) {
            return this.element?.querySelectorAll(query)[nth];
        } else {
            return this.element?.querySelector(query);
        }
    }

    /** Returns the default value if the provided value is not defined. */
    private defaultValue(value: any | null | undefined, defaultValue: any) {
        return value != null ? value : defaultValue;
    }
}

export class ReactHarness {
    private container: HTMLElement;

    private wrapper: ReactWrapper<any> | undefined;

    constructor() {
        this.container = document.createElement("div");
        document.body.appendChild(this.container);
    }

    public mount(component: React.ReactElement<any>) {
        // wrap in a root provider to avoid console warnings
        this.wrapper = mount(React.createElement(BlueprintProvider, { children: component }), {
            attachTo: this.container,
        });
        return new ElementHarness(this.container);
    }

    public unmount() {
        if (this.wrapper) {
            this.wrapper.unmount();
            this.wrapper = undefined;
        }
    }

    public destroy() {
        document.body.removeChild(this.container);
        // @ts-ignore
        delete this.container;
    }
}
