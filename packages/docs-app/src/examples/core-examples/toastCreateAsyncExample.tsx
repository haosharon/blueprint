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

import { Button, Intent, OverlayToaster } from "@blueprintjs/core";
import { Example, type ExampleProps } from "@blueprintjs/docs-theme";

// This example adapts the docs example slightly:
// https://blueprintjs.com/docs/#core/components/toast.example
//
// Instead of a singleton toaster, the Toaster is only created when the user
// clicks the button. This avoids creating a singleton Toaster for the entire
// Blueprint docs app.
export const ToastCreateAsyncExample: React.FC<ExampleProps> = props => {
    const [isToastShown, setIsToastShown] = React.useState(false);

    const handleClick = React.useCallback(async () => {
        setIsToastShown(true);
        try {
            await showMessageFromNewToaster();
        } finally {
            setIsToastShown(false);
        }
    }, []);

    return (
        <Example options={null} {...props}>
            <Button
                intent={Intent.PRIMARY}
                onClick={handleClick}
                // Disable the button while the toaster is shown. Since this
                // button creates a new OverlayToaster each time, the toasts
                // will overlap.
                disabled={isToastShown}
            >
                Toast please
            </Button>
        </Example>
    );
};

/**
 * Create a new OverlayToaster and show a message. The return promise will
 * resolve when the message has been dismissed.
 */
async function showMessageFromNewToaster() {
    const container = document.createElement("div");
    let root: ReactDOMClient.Root | undefined;
    // Since this toaster isn't created in a portal, a fixed position container
    // is required for it to show at the top of the viewport. Otherwise the
    // toaster won't be visible until the user scrolls upward.
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.width = "100%";

    document.body.appendChild(container);

    return new Promise<void>(async resolve => {
        async function onDismiss() {
            resolve();

            // Wait for the message to fade out before completely unmounting the OverlayToaster.
            await sleep(1_000);

            root.unmount();
            root = undefined;
            document.body.removeChild(container);
        }

        const toaster = await OverlayToaster.create(
            {},
            {
                container,
                domRenderer: (element, domContainer) => {
                    root = ReactDOMClient.createRoot(domContainer);
                    root.render(element);
                },
            },
        );
        toaster.show({ intent: Intent.PRIMARY, message: "Toasted", onDismiss });
    });
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
