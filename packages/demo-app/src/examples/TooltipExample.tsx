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

import { Classes, Icon, Tooltip } from "@blueprintjs/core";

import { ExampleCard } from "./ExampleCard";

export const TooltipExample = React.memo(() => {
    return (
        <ExampleCard label="Tooltip" width={200}>
            <Tooltip
                className={Classes.TOOLTIP_INDICATOR}
                content={
                    <span>
                        <Icon icon="tick-circle" intent="success" style={{ marginRight: 7 }} />
                        Always open tooltip
                    </span>
                }
            >
                Always open target
            </Tooltip>
            <Tooltip className={Classes.TOOLTIP_INDICATOR} content={<span>Regular tooltip</span>}>
                Regular target
            </Tooltip>
        </ExampleCard>
    );
});

TooltipExample.displayName = "DemoApp.TooltipExample";
