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

import classNames from "classnames";
import * as React from "react";

import {
    useInteractiveAttributes,
    type UseInteractiveAttributesOptions,
} from "../../accessibility/useInteractiveAttributes";
import { Alignment, Classes, Utils } from "../../common";
import { ALIGN_TEXT_LEFT, ALIGN_TEXT_RIGHT, BUTTON_WARN_MINIMAL, BUTTON_WARN_OUTLINED } from "../../common/errors";
import { DISPLAYNAME_PREFIX, removeNonHTMLProps } from "../../common/props";
import { useValidateProps } from "../../hooks/useValidateProps";
import { Icon } from "../icon/icon";
import { Spinner, SpinnerSize } from "../spinner/spinner";
import { Text } from "../text/text";

import type { AnchorButtonProps, ButtonProps } from "./buttonProps";

/**
 * Button component.
 *
 * @see https://blueprintjs.com/docs/#core/components/button
 */
export const Button: React.FC<ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const commonAttributes = useSharedButtonAttributes(props, ref);

    return (
        <button type="button" {...removeNonHTMLProps(props)} {...commonAttributes}>
            {renderButtonContents(props)}
        </button>
    );
});
Button.displayName = `${DISPLAYNAME_PREFIX}.Button`;

/**
 * AnchorButton component.
 *
 * @see https://blueprintjs.com/docs/#core/components/button
 */
export const AnchorButton: React.FC<AnchorButtonProps> = React.forwardRef<HTMLAnchorElement, AnchorButtonProps>(
    (props, ref) => {
        const { href } = props;
        const commonProps = useSharedButtonAttributes(props, ref, {
            defaultTabIndex: 0,
            disabledTabIndex: -1,
        });

        return (
            <a
                role="button"
                {...removeNonHTMLProps(props)}
                {...commonProps}
                aria-disabled={commonProps.disabled}
                href={commonProps.disabled ? undefined : href}
            >
                {renderButtonContents(props)}
            </a>
        );
    },
);
AnchorButton.displayName = `${DISPLAYNAME_PREFIX}.AnchorButton`;

/**
 * Most of the button logic lives in this shared hook.
 */
function useSharedButtonAttributes<E extends HTMLAnchorElement | HTMLButtonElement>(
    props: E extends HTMLAnchorElement ? AnchorButtonProps : ButtonProps,
    ref: React.Ref<E>,
    options?: UseInteractiveAttributesOptions,
) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { alignText, fill, large, loading = false, minimal, outlined, small, variant = "solid" } = props;
    const disabled = props.disabled || loading;

    const [active, interactiveProps] = useInteractiveAttributes(!disabled, props, ref, options);

    useValidateProps(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (alignText === Alignment.LEFT) {
            console.warn(ALIGN_TEXT_LEFT);
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (alignText === Alignment.RIGHT) {
            console.warn(ALIGN_TEXT_RIGHT);
        }
        if (minimal != null) {
            console.warn(BUTTON_WARN_MINIMAL);
        }
        if (outlined != null) {
            console.warn(BUTTON_WARN_OUTLINED);
        }
    }, [alignText, minimal, outlined]);

    const className = classNames(
        Classes.BUTTON,
        {
            [Classes.ACTIVE]: active,
            [Classes.DISABLED]: disabled,
            [Classes.FILL]: fill,
            [Classes.LARGE]: large,
            [Classes.LOADING]: loading,
            [Classes.SMALL]: small,
        },
        Classes.alignmentClass(alignText),
        Classes.intentClass(props.intent),
        Classes.variantClass(variant, { minimal, outlined }),
        props.className,
    );

    return {
        ...interactiveProps,
        className,
        disabled,
    };
}

/**
 * Shared rendering code for button contents.
 */
function renderButtonContents<E extends HTMLAnchorElement | HTMLButtonElement>(
    props: E extends HTMLAnchorElement ? AnchorButtonProps : ButtonProps,
) {
    const { children, ellipsizeText, icon, loading, rightIcon, text, textClassName } = props;
    const hasTextContent = !Utils.isReactNodeEmpty(text) || !Utils.isReactNodeEmpty(children);
    return (
        <>
            {loading && <Spinner key="loading" className={Classes.BUTTON_SPINNER} size={SpinnerSize.SMALL} />}
            <Icon key="leftIcon" icon={icon} />
            {hasTextContent && (
                <Text
                    key="text"
                    className={classNames(Classes.BUTTON_TEXT, textClassName)}
                    ellipsize={ellipsizeText}
                    tagName="span"
                >
                    {text}
                    {children}
                </Text>
            )}
            <Icon key="rightIcon" icon={rightIcon} />
        </>
    );
}
