/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
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
import * as ReactDOM from "react-dom";

import { Classes, DISPLAYNAME_PREFIX, type Props } from "../../common";
import { PortalContext } from "../../context/portal/portalProvider";

export interface PortalProps extends Props {
    /** Contents to send through the portal. */
    children: React.ReactNode;

    /**
     * Callback invoked when the children of this `Portal` have been added to the DOM.
     */
    onChildrenMount?: () => void;

    /**
     * The HTML element that children will be mounted to.
     *
     * @default PortalProvider#portalContainer ?? document.body
     */
    container?: HTMLElement;

    /**
     * A list of DOM events which should be stopped from propagating through this portal element.
     *
     * @deprecated this prop's implementation no longer works in React v17+
     * @see https://legacy.reactjs.org/docs/portals.html#event-bubbling-through-portals
     * @see https://github.com/palantir/blueprint/issues/6124
     * @see https://github.com/palantir/blueprint/issues/6580
     */
    stopPropagationEvents?: Array<keyof HTMLElementEventMap>;
}

/**
 * Portal component.
 *
 * This component detaches its contents and re-attaches them to document.body.
 * Use it when you need to circumvent DOM z-stacking (for dialogs, popovers, etc.).
 * Any class names passed to this element will be propagated to the new container element on document.body.
 *
 * @see https://blueprintjs.com/docs/#core/components/portal
 */
export function Portal(
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    { className, stopPropagationEvents, container, onChildrenMount, children }: PortalProps,
) {
    const context = React.useContext(PortalContext);

    const portalContainer =
        container ?? context.portalContainer ?? (typeof document !== "undefined" ? document.body : undefined);

    const [portalElement, setPortalElement] = React.useState<HTMLElement>();

    const createPortalElement = React.useCallback(() => {
        const newPortalElement = document.createElement("div");
        newPortalElement.classList.add(Classes.PORTAL);
        maybeAddClass(newPortalElement.classList, className); // directly added to this portal element
        maybeAddClass(newPortalElement.classList, context.portalClassName); // added via PortalProvider context
        addStopPropagationListeners(newPortalElement, stopPropagationEvents);

        return newPortalElement;
    }, [className, context.portalClassName, stopPropagationEvents]);

    // create the container element & attach it to the DOM
    React.useEffect(() => {
        if (portalContainer == null) {
            return;
        }
        const newPortalElement = createPortalElement();
        portalContainer.appendChild(newPortalElement);
        setPortalElement(newPortalElement);

        return () => {
            removeStopPropagationListeners(newPortalElement, stopPropagationEvents);
            newPortalElement.remove();
            setPortalElement(undefined);
        };
    }, [portalContainer, createPortalElement, stopPropagationEvents]);

    // wait until next successful render to invoke onChildrenMount callback
    React.useEffect(() => {
        if (portalElement != null) {
            onChildrenMount?.();
        }
    }, [portalElement, onChildrenMount]);

    React.useEffect(() => {
        if (portalElement != null) {
            maybeAddClass(portalElement.classList, className);
            return () => maybeRemoveClass(portalElement.classList, className);
        }
        return undefined;
    }, [className, portalElement]);

    React.useEffect(() => {
        if (portalElement != null) {
            addStopPropagationListeners(portalElement, stopPropagationEvents);
            return () => removeStopPropagationListeners(portalElement, stopPropagationEvents);
        }
        return undefined;
    }, [portalElement, stopPropagationEvents]);

    // Only render `children` once this component has mounted in a browser environment, so they are
    // immediately attached to the DOM tree and can do DOM things like measuring or `autoFocus`.
    // See long comment on componentDidMount in https://reactjs.org/docs/portals.html#event-bubbling-through-portals
    if (typeof document === "undefined" || portalElement == null) {
        return null;
    } else {
        return ReactDOM.createPortal(children, portalElement);
    }
}

Portal.displayName = `${DISPLAYNAME_PREFIX}.Portal`;

function maybeRemoveClass(classList: DOMTokenList, className?: string) {
    if (className != null && className !== "") {
        classList.remove(...className.split(" "));
    }
}

function maybeAddClass(classList: DOMTokenList, className?: string) {
    if (className != null && className !== "") {
        classList.add(...className.split(" "));
    }
}

function addStopPropagationListeners(portalElement: HTMLElement, eventNames?: Array<keyof HTMLElementEventMap>) {
    eventNames?.forEach(event => portalElement.addEventListener(event, handleStopProgation));
}

function removeStopPropagationListeners(portalElement: HTMLElement, events?: Array<keyof HTMLElementEventMap>) {
    events?.forEach(event => portalElement.removeEventListener(event, handleStopProgation));
}

function handleStopProgation(e: Event) {
    e.stopPropagation();
}
