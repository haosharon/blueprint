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

import classNames from "classnames";
import * as React from "react";

import { Classes } from "../../common";
import { DISPLAYNAME_PREFIX, type Props } from "../../common/props";
import type { Size } from "../../common/size";

export interface FileInputProps extends React.LabelHTMLAttributes<HTMLLabelElement>, Props {
    /**
     * Whether the file input is non-interactive.
     * Setting this to `true` will automatically disable the child input too.
     */
    disabled?: boolean;

    /**
     * Whether the file input should take up the full width of its container.
     */
    fill?: boolean;

    /**
     * Whether the user has made a selection in the input. This will affect the component's
     * text styling. Make sure to set a non-empty value for the text prop as well.
     *
     * @default false
     */
    hasSelection?: boolean;

    /**
     * The props to pass to the child input.
     * `disabled` will be ignored in favor of the top-level prop.
     * `type` will be ignored, because the input _must_ be `type="file"`.
     * Pass `onChange` here to be notified when the user selects a file.
     */
    inputProps?: React.HTMLProps<HTMLInputElement>;

    /**
     * Whether the file input should appear with large styling.
     *
     * @deprecated use `size="large"` instead.
     * @default false
     */
    large?: boolean;

    /**
     * Callback invoked on `<input>` `change` events.
     *
     * This callback is offered as a convenience; it is equivalent to `inputProps.onChange`.
     *
     * __Note:__ The top-level `onChange` prop is passed to the `<label>` element rather than the `<input>`,
     * which may not be what you expect.
     */
    onInputChange?: React.FormEventHandler<HTMLInputElement>;

    /**
     * Whether the file input should appear with small styling.
     *
     * @deprecated use `size="small"` instead.
     * @default false
     */
    small?: boolean;

    /**
     * The size of the file input.
     */
    size?: Size;

    /**
     * The text to display inside the input.
     *
     * @default "Choose file..."
     */
    text?: React.ReactNode;

    /**
     * The button text to display on the right side of the input.
     *
     * @default "Browse"
     */
    buttonText?: string;
}

const NS = Classes.getClassNamespace();

// this is a simple component, unit tests would be mostly tautological
/* istanbul ignore next */
/**
 * File input component.
 *
 * @see https://blueprintjs.com/docs/#core/components/file-input
 */
export const FileInput = (props: FileInputProps) => {
    const {
        buttonText,
        className,
        disabled,
        fill,
        hasSelection = false,
        inputProps = {},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        large = false,
        onInputChange,
        size = "medium",
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        small = false,
        text = "Choose file...",
        ...htmlProps
    } = props;

    const rootClasses = classNames(
        className,
        Classes.FILE_INPUT,
        {
            [Classes.DISABLED]: disabled,
            [Classes.FILL]: fill,
            [Classes.FILE_INPUT_HAS_SELECTION]: hasSelection,
        },
        Classes.sizeClass(size, { large, small }),
    );

    const uploadProps = {
        [`${NS}-button-text`]: buttonText,
        className: classNames(Classes.FILE_UPLOAD_INPUT, {
            [Classes.FILE_UPLOAD_INPUT_CUSTOM_TEXT]: !!buttonText,
        }),
    } satisfies React.HTMLProps<HTMLElement>;

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        onInputChange?.(e);
        inputProps?.onChange?.(e);
    };

    return (
        <label {...htmlProps} className={rootClasses}>
            <input {...inputProps} onChange={handleInputChange} type="file" disabled={disabled} />
            <span {...uploadProps}>{text}</span>
        </label>
    );
};

FileInput.displayName = `${DISPLAYNAME_PREFIX}.FileInput`;
