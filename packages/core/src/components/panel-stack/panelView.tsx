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

import { Classes, DISPLAYNAME_PREFIX } from "../../common";
import { Button } from "../button/buttons";
import { Text } from "../text/text";

import type { Panel, PanelProps } from "./panelTypes";

export interface PanelViewProps<T extends Panel<object>> {
    /**
     * Callback invoked when the user presses the back button or a panel invokes
     * the `closePanel()` injected prop method.
     */
    onClose: (removedPanel: T) => void;

    /**
     * Callback invoked when a panel invokes the `openPanel(panel)` injected
     * prop method.
     */
    onOpen: (addedPanel: T) => void;

    /** The panel to be displayed. */
    panel: T;

    /** The previous panel in the stack, for rendering the "back" button. */
    previousPanel?: T;

    /** Whether to show the header with the "back" button. */
    showHeader: boolean;
}

interface PanelViewComponent {
    <T extends Panel<object>>(props: PanelViewProps<T>): React.JSX.Element | null;
    displayName: string;
}

export const PanelView: PanelViewComponent = <T extends Panel<object>>({
    panel,
    onClose,
    onOpen,
    previousPanel,
    showHeader,
}: PanelViewProps<T>) => {
    const hasPreviousPanel = previousPanel !== undefined;
    const handleClose = React.useCallback(() => {
        // only remove this panel if it is not the only one.
        if (hasPreviousPanel) {
            onClose(panel);
        }
    }, [onClose, panel, hasPreviousPanel]);

    const maybeBackButton =
        previousPanel === undefined ? null : (
            <Button
                aria-label="Back"
                className={Classes.PANEL_STACK_HEADER_BACK}
                icon="chevron-left"
                onClick={handleClose}
                size="small"
                text={previousPanel.title}
                title={previousPanel.htmlTitle}
                variant="minimal"
            />
        );

    // `panel.renderPanel` is simply a function that returns a React.JSX.Element. It may be an FC which
    // uses hooks. In order to avoid React errors due to inconsistent hook calls, we must encapsulate
    // those hooks with their own lifecycle through a very simple wrapper component.
    const PanelWrapper: React.FC = React.useMemo(
        () => () =>
            // N.B. A type cast is required because of error TS2345, where technically `panel.props` could be
            // instantiated with a type unrelated to our generic constraint `T` here. We know
            // we're sending the right values here though, and it makes the consumer API for this
            // component type safe, so it's ok to do this...
            panel.renderPanel({
                closePanel: handleClose,
                openPanel: onOpen,
                ...panel.props,
            } as PanelProps<T>),
        [panel, handleClose, onOpen],
    );

    return (
        <div className={Classes.PANEL_STACK_VIEW}>
            {showHeader && (
                <div className={Classes.PANEL_STACK_HEADER}>
                    {/* two <span> tags here ensure title is centered as long as possible, with `flex: 1` styling */}
                    <span>{maybeBackButton}</span>
                    <Text className={Classes.HEADING} ellipsize={true} title={panel.htmlTitle}>
                        {panel.title}
                    </Text>
                    <span />
                </div>
            )}
            <PanelWrapper />
        </div>
    );
};
PanelView.displayName = `${DISPLAYNAME_PREFIX}.PanelView`;
