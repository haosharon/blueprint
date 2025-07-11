/*
 * Copyright 2023 Palantir Technologies, Inc. All rights reserved.
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

import classNames from "classnames";
import * as React from "react";

import { Classes, DISPLAYNAME_PREFIX } from "../../common";
import type { HTMLDivProps, Props } from "../../common/props";

export interface DialogBodyProps extends Props, HTMLDivProps {
    /** Dialog body contents. */
    children?: React.ReactNode;

    /**
     * Enable scrolling for the container
     *
     * @default true
     */
    useOverflowScrollContainer?: boolean;
}

/**
 * Dialog body component.
 *
 * @see https://blueprintjs.com/docs/#core/components/dialog.dialog-body-props
 */
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>((props, ref) => {
    const { children, className, useOverflowScrollContainer = true, ...htmlProps } = props;
    return (
        <div
            {...htmlProps}
            className={classNames(Classes.DIALOG_BODY, className, {
                [Classes.DIALOG_BODY_SCROLL_CONTAINER]: useOverflowScrollContainer,
            })}
            ref={ref}
        >
            {children}
        </div>
    );
});

DialogBody.displayName = `${DISPLAYNAME_PREFIX}.DialogBody`;
