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

import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

import { Classes } from "../../common";
import { OverlaysProvider } from "../../context/overlays/overlaysProvider";

import { ContextMenuPopover, type ContextMenuPopoverProps } from "./contextMenuPopover";

/**
 * Options for specifying how an imperatively created context menu should be rendered to the DOM.
 */
export interface ShowContextMenuOptions {
    /**
     * A new DOM element will be created and appended to this container.
     *
     * @default document.body
     */
    container?: HTMLElement;
    /**
     * A function render the React component onto a newly created DOM element. This should return a function which
     * unmounts the rendered element from the DOM.
     *
     * By default this creates a react DOM client root, renders the element into that node and returns a function
     * which unmounts the root.
     */
    render?: ShowContextMenuDOMRenderer;
}

type ShowContextMenuDOMRenderer = (
    element: React.ReactElement<ContextMenuPopoverProps>,
    container: Element | DocumentFragment,
) => ShowContextMenuDOMUnmounter;

type ShowContextMenuDOMUnmounter = () => void;

interface ContextMenuState {
    element: HTMLElement;
    unmount: () => void;
}

/** State which contains the context menu singleton instance for the imperative ContextMenu APIs. */
let contextMenuState: ContextMenuState | undefined;

/**
 * Show a context menu at a particular offset from the top-left corner of the document.
 * The menu will appear below-right of this point and will flip to below-left if there is not enough
 * room onscreen. Additional props like `onClose`, `isDarkTheme`, etc. can be forwarded to the `<ContextMenuPopover>`.
 *
 * Context menus created with this API will automatically close when a user clicks outside the popover.
 * You may force them to close by using `hideContextMenu()`.
 *
 * Note that this API relies on global state in the @blueprintjs/core package, and should be used with caution,
 * especially if your build system allows multiple copies of Blueprint libraries to be bundled into an application at
 * once.
 *
 * Alternative APIs to consider which do not have the limitations of global state:
 *  - `<ContextMenu>`
 *  - `<ContextMenuPopover>`
 *
 * @see https://blueprintjs.com/docs/#core/components/context-menu-popover.imperative-api
 */
export function showContextMenu(props: Omit<ContextMenuPopoverProps, "isOpen">, options: ShowContextMenuOptions = {}) {
    const { container = document.body, render = defaultDomRenderer } = options;

    if (contextMenuState == null) {
        const element = document.createElement("div");
        element.classList.add(Classes.CONTEXT_MENU);
        container.appendChild(element);
        contextMenuState = { element, unmount: undefined! };
    } else {
        // N.B. It's important to unmount previous instances of the ContextMenuPopover rendered by this function.
        // Otherwise, React will detect no change in props sent to the already-mounted component, and therefore
        // do nothing after the first call to this function, leading to bugs like https://github.com/palantir/blueprint/issues/5949
        contextMenuState.unmount();
    }

    contextMenuState.unmount = render(
        <OverlaysProvider>
            <UncontrolledContextMenuPopover {...props} />
        </OverlaysProvider>,
        contextMenuState.element,
    );
}

const defaultDomRenderer: ShowContextMenuDOMRenderer = (element, container) => {
    const root = ReactDOMClient.createRoot(container);
    root.render(element);
    return () => root.unmount();
};

/**
 * Hide a context menu that was created using `showContextMenu()`.
 *
 * Note that this API relies on global state in the @blueprintjs/core package, and should be used with caution.
 *
 * @see https://blueprintjs.com/docs/#core/components/context-menu-popover.imperative-api
 */

export function hideContextMenu() {
    contextMenuState?.unmount();
    contextMenuState = undefined;
}

/**
 * A simple wrapper around `ContextMenuPopover` which is open by default and uncontrolled.
 * It closes when a user clicks outside the popover.
 */
function UncontrolledContextMenuPopover({ onClose, ...props }: Omit<ContextMenuPopoverProps, "isOpen">) {
    const [isOpen, setIsOpen] = React.useState(true);
    const handleClose = React.useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    return <ContextMenuPopover isOpen={isOpen} {...props} onClose={handleClose} />;
}
