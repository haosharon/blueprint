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

import classNames from "classnames";
import * as React from "react";

import { type IconName, IconSize, SmallCross } from "@blueprintjs/icons";

import {
    AbstractPureComponent,
    Classes,
    DISPLAYNAME_PREFIX,
    type MaybeElement,
    mergeRefs,
    type Props,
} from "../../common";
import * as Errors from "../../common/errors";
import { uniqueId } from "../../common/utils";
import { Button } from "../button/buttons";
import { H6 } from "../html/html";
import { Icon } from "../icon/icon";
import type { BackdropProps, OverlayableProps } from "../overlay/overlayProps";
import { Overlay2, OVERLAY2_DEFAULT_PROPS } from "../overlay2/overlay2";

export interface DialogProps extends OverlayableProps, BackdropProps, Props {
    /** Dialog contents. */
    children?: React.ReactNode;

    /**
     * Toggles the visibility of the overlay and its children.
     * This prop is required because the component is controlled.
     */
    isOpen: boolean;

    /**
     * Dialog always has a backdrop so this prop cannot be overriden.
     */
    hasBackdrop?: never;

    /**
     * Name of a Blueprint UI icon (or an icon element) to render in the
     * dialog's header. Note that the header will only be rendered if `title` is
     * provided.
     */
    icon?: IconName | MaybeElement;

    /**
     * Whether to show the close button in the dialog's header.
     * Note that the header will only be rendered if `title` is provided.
     *
     * @default true
     */
    isCloseButtonShown?: boolean;

    /**
     * @default "dialog"
     */
    role?: Extract<React.AriaRole, "dialog" | "alertdialog">;

    /**
     * CSS styles to apply to the dialog.
     *
     * @default {}
     */
    style?: React.CSSProperties;

    /**
     * Title of the dialog. If provided, an element with `Classes.DIALOG_HEADER`
     * will be rendered inside the dialog before any children elements.
     */
    title?: React.ReactNode;

    /**
     * Name of the transition for internal `CSSTransition`. Providing your own
     * name here will require defining new CSS transition properties.
     */
    transitionName?: string;

    /**
     * Ref attached to the `Classes.DIALOG_CONTAINER` element.
     */
    containerRef?: React.Ref<HTMLDivElement>;

    /**
     * ID of the element that contains title or label text for this dialog.
     *
     * By default, if the `title` prop is supplied, this component will generate
     * a unique ID for the `<H5>` title element and use that ID here.
     */
    "aria-labelledby"?: string;

    /**
     * ID of an element that contains description text inside this dialog.
     */
    "aria-describedby"?: string;
}

/**
 * Dialog component.
 *
 * @see https://blueprintjs.com/docs/#core/components/dialog
 */
export class Dialog extends AbstractPureComponent<DialogProps> {
    public static defaultProps: DialogProps = {
        canOutsideClickClose: true,
        isOpen: false,
    };

    private childRef = React.createRef<HTMLDivElement>();

    private titleId: string;

    public static displayName = `${DISPLAYNAME_PREFIX}.Dialog`;

    public constructor(props: DialogProps) {
        super(props);

        const id = uniqueId("bp-dialog");
        this.titleId = `title-${id}`;
    }

    public render() {
        const { className, children, containerRef, style, title, role = "dialog", ...overlayProps } = this.props;

        return (
            <Overlay2
                {...overlayProps}
                className={Classes.OVERLAY_SCROLL_CONTAINER}
                childRef={this.childRef}
                hasBackdrop={true}
            >
                <div className={Classes.DIALOG_CONTAINER} ref={mergeRefs(containerRef, this.childRef)}>
                    <div
                        className={classNames(Classes.DIALOG, className)}
                        role={role}
                        aria-modal={overlayProps.enforceFocus ?? OVERLAY2_DEFAULT_PROPS.enforceFocus}
                        aria-labelledby={this.props["aria-labelledby"] || (title ? this.titleId : undefined)}
                        aria-describedby={this.props["aria-describedby"]}
                        style={style}
                    >
                        {this.maybeRenderHeader()}
                        {children}
                    </div>
                </div>
            </Overlay2>
        );
    }

    protected validateProps(props: DialogProps) {
        if (props.title == null) {
            if (props.icon != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_ICON);
            }
            if (props.isCloseButtonShown != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_CLOSE_BUTTON);
            }
        }
    }

    private maybeRenderCloseButton() {
        // show close button if prop is undefined or null
        // this gives us a behavior as if the default value were `true`
        if (this.props.isCloseButtonShown !== false) {
            return (
                <Button
                    aria-label="Close"
                    className={Classes.DIALOG_CLOSE_BUTTON}
                    icon={<SmallCross size={IconSize.STANDARD} />}
                    onClick={this.props.onClose}
                    variant="minimal"
                />
            );
        } else {
            return undefined;
        }
    }

    private maybeRenderHeader() {
        const { icon, title } = this.props;
        if (title == null) {
            return undefined;
        }
        return (
            <div className={Classes.DIALOG_HEADER}>
                <Icon icon={icon} size={IconSize.STANDARD} aria-hidden={true} tabIndex={-1} />
                <H6 id={this.titleId}>{title}</H6>
                {this.maybeRenderCloseButton()}
            </div>
        );
    }
}
