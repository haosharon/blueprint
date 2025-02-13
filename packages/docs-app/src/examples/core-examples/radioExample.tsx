/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import { Alignment, Card, H5, Radio, RadioGroup, type RadioProps, Switch } from "@blueprintjs/core";
import { Example, type ExampleProps, handleBooleanChange, handleStringChange } from "@blueprintjs/docs-theme";

import { AlignmentSelect } from "./common/alignmentSelect";

export const RadioExample: React.FC<ExampleProps> = props => {
    const [alignIndicator, setAlignIndicator] = React.useState<Alignment>(Alignment.START);
    const [disabled, setDisabled] = React.useState(false);
    const [inline, setInline] = React.useState(false);
    const [large, setLarge] = React.useState(false);
    const [value, setValue] = React.useState<string>();

    const options = (
        <>
            <H5>Props</H5>
            <Switch checked={disabled} label="Disabled" onChange={handleBooleanChange(setDisabled)} />
            <Switch checked={inline} label="Inline" onChange={handleBooleanChange(setInline)} />
            <Switch checked={large} label="Large" onChange={handleBooleanChange(setLarge)} />
            <AlignmentSelect align={alignIndicator} label="Align indicator" onChange={setAlignIndicator} />
        </>
    );

    const radioProps: RadioProps = { alignIndicator, disabled, inline, large };

    return (
        <Example options={options} {...props}>
            <Card>
                <RadioGroup
                    inline={inline}
                    label="Determine lunch"
                    name="group"
                    onChange={handleStringChange(setValue)}
                    selectedValue={value}
                >
                    <Radio {...radioProps} label="Soup" value="one" />
                    <Radio {...radioProps} label="Salad" value="two" />
                    <Radio {...radioProps} label="Sandwich" value="three" />
                </RadioGroup>
            </Card>
        </Example>
    );
};
