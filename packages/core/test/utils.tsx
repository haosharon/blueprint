/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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

import { ReactWrapper } from "enzyme";
import * as React from "react";

import { Portal, type PortalProps } from "../src";

export function findInPortal<P>(overlay: ReactWrapper<P>, selector: string) {
    // React 16: createPortal preserves React tree so simple find works.
    const element = overlay.find(Portal).find(selector);
    if (element.exists()) {
        return element;
    }

    // React 15: unstable_renderSubtree does not preserve tree so we must create new wrapper.
    const portal = overlay.find(Portal).instance() as React.Component<PortalProps>;
    const portalChildren = new ReactWrapper(<>{portal.props.children}</>);
    if (portalChildren.is(selector)) {
        return portalChildren;
    }
    return portalChildren.find(selector);
}

export async function sleep(timeout?: number) {
    return new Promise(resolve => window.setTimeout(resolve, timeout));
}

export const hasClass = (element: Element, className: string) => element.classList.contains(className);
