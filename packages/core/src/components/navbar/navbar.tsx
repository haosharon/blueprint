/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
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
import { DISPLAYNAME_PREFIX, type HTMLDivProps, type Props } from "../../common/props";

import { NavbarDivider } from "./navbarDivider";
import { NavbarGroup } from "./navbarGroup";
import { NavbarHeading } from "./navbarHeading";

export interface NavbarProps extends Props, HTMLDivProps {
    children?: React.ReactNode;

    /**
     * Whether this navbar should be fixed to the top of the viewport (using CSS `position: fixed`).
     */
    fixedToTop?: boolean;
}

// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
/**
 * Navbar component.
 *
 * @see https://blueprintjs.com/docs/#core/components/navbar
 */
export const Navbar: React.FC<NavbarProps> & {
    Divider: typeof NavbarDivider;
    Group: typeof NavbarGroup;
    Heading: typeof NavbarHeading;
} = props => {
    const { children, className, fixedToTop, ...htmlProps } = props;
    const classes = classNames(Classes.NAVBAR, { [Classes.FIXED_TOP]: fixedToTop }, className);
    return (
        <div className={classes} {...htmlProps}>
            {children}
        </div>
    );
};

Navbar.displayName = `${DISPLAYNAME_PREFIX}.Navbar`;

// compound components of Navbar
/** @deprecated Use `NavbarDivider` instead */
Navbar.Divider = NavbarDivider;
/** @deprecated Use `NavbarGroup` instead */
Navbar.Group = NavbarGroup;
/** @deprecated Use `NavbarHeading` instead */
Navbar.Heading = NavbarHeading;
