/*
 * Copyright 2021 Palantir Technologies, Inc. All rights reserved.
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

import * as React from "react";

import * as Errors from "../../common/errors";
import { isFunction, isNodeEnv } from "../../common/utils";
import { type HotkeyConfig, useHotkeys, type UseHotkeysOptions } from "../../hooks";

/** Identical to the return type of `useHotkeys` hook. */
export interface HotkeysTargetRenderProps {
    handleKeyDown: React.KeyboardEventHandler<HTMLElement>;
    handleKeyUp: React.KeyboardEventHandler<HTMLElement>;
}

/** @deprecated Use `HotkeysTargetRenderProps` instead */
export type HotkeysTarget2RenderProps = HotkeysTargetRenderProps;

export interface HotkeysTargetProps {
    /**
     * Render prop which receives the same callback handlers generated by the `useHotkeys` hook.
     * If your hotkey definitions are all global, you may supply an element instead.
     */
    children: React.JSX.Element | ((props: HotkeysTargetRenderProps) => React.JSX.Element);

    /** Hotkey definitions. */
    hotkeys: readonly HotkeyConfig[];

    /** Hook customization options. */
    options?: UseHotkeysOptions;
}

/** @deprecated Use `HotkeysTargetProps` instead */
export type HotkeysTarget2Props = HotkeysTargetProps;

/**
 * Utility component which allows consumers to use the new `useHotkeys` hook inside
 * React component classes. The implementation simply passes through to the hook.
 */
export const HotkeysTarget = ({ children, hotkeys, options }: HotkeysTargetProps): React.JSX.Element => {
    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys, options);

    // run props validation
    React.useEffect(() => {
        if (!isNodeEnv("production")) {
            if (typeof children !== "function" && hotkeys.some(h => !h.global)) {
                console.error(Errors.HOTKEYS_TARGET_CHILDREN_LOCAL_HOTKEYS);
            }
        }
    }, [hotkeys, children]);

    if (isFunction(children)) {
        return children({ handleKeyDown, handleKeyUp });
    } else {
        return children;
    }
};

/** @deprecated Use `HotkeysTarget` instead */
export const HotkeysTarget2 = HotkeysTarget;
