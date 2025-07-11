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

import { Button, Intent } from "@blueprintjs/core";

import { ExampleCard } from "./ExampleCard";

const WIDTH = 150;

export const ButtonExample = React.memo(() => {
    return (
        <div className="example-row">
            <ExampleCard label="Button" subLabel="Default" width={WIDTH}>
                {Object.values(Intent).map(intent => (
                    <Button key={`${intent}-button`} icon="add" intent={intent} text="Button" />
                ))}
            </ExampleCard>
            <ExampleCard label="Button" subLabel="Disabled" width={WIDTH}>
                {Object.values(Intent).map(intent => (
                    <Button key={`${intent}-button`} disabled={true} icon="add" intent={intent} text="Button" />
                ))}
            </ExampleCard>
            <ExampleCard label="Button" subLabel="Minimal" width={WIDTH}>
                {Object.values(Intent).map(intent => (
                    <Button key={`${intent}-button`} icon="add" intent={intent} text="Button" variant="minimal" />
                ))}
            </ExampleCard>
            <ExampleCard label="Button" subLabel="Minimal, Disabled" width={WIDTH}>
                {Object.values(Intent).map(intent => (
                    <Button
                        key={`${intent}-button`}
                        disabled={true}
                        icon="add"
                        intent={intent}
                        text="Button"
                        variant="minimal"
                    />
                ))}
            </ExampleCard>
        </div>
    );
});

ButtonExample.displayName = "DemoApp.ButtonExample";
