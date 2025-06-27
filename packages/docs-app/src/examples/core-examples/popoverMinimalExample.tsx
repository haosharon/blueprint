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

import * as React from "react";

import { Button, Intent, Popover } from "@blueprintjs/core";
import { Example, type ExampleProps } from "@blueprintjs/docs-theme";

import { FileMenu } from "../core-examples/common/fileMenu";

export const PopoverMinimalExample: React.FC<ExampleProps> = props => (
    <Example options={false} {...props}>
        <Popover
            content={<FileMenu />}
            minimal={true}
            placement="bottom-end"
            renderTarget={({ isOpen, ...rest }) => (
                <Button {...rest} active={isOpen} intent={Intent.PRIMARY} text="Minimal" />
            )}
        />
        <Popover
            content={<FileMenu />}
            placement="bottom-end"
            renderTarget={({ isOpen, ...rest }) => <Button {...rest} active={isOpen} text="Default" />}
        />
    </Example>
);
