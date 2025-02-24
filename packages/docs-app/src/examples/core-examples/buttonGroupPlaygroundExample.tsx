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

import {
    AnchorButton,
    Button,
    ButtonGroup,
    type ButtonVariant,
    Classes,
    H5,
    Icon,
    Intent,
    type Size,
    Switch,
    TextAlignment,
    Tooltip,
} from "@blueprintjs/core";
import { Example, type ExampleProps, handleBooleanChange } from "@blueprintjs/docs-theme";
import { IconNames } from "@blueprintjs/icons";

import { IntentSelect } from "./common/intentSelect";
import { SizeSelect } from "./common/sizeSelect";
import { TextAlignmentSelect } from "./common/textAlignmentSelect";
import { VariantSelect } from "./common/variantSelect";

export const ButtonGroupPlaygroundExample: React.FC<ExampleProps> = props => {
    const [alignText, setAlignText] = React.useState<TextAlignment>(TextAlignment.CENTER);
    const [fill, setFill] = React.useState(false);
    const [iconOnly, setIconOnly] = React.useState(false);
    const [intent, setIntent] = React.useState<Intent>(Intent.NONE);
    const [large, setLarge] = React.useState(false);
    const [size, setSize] = React.useState<Size>("medium");
    const [variant, setVariant] = React.useState<ButtonVariant>("solid");
    const [vertical, setVertical] = React.useState(false);

    const options = (
        <>
            <H5>Props</H5>
            <Switch checked={fill} label="Fill" onChange={handleBooleanChange(setFill)} />
            <Switch checked={large} label="Large" onChange={handleBooleanChange(setLarge)} />
            <Switch checked={vertical} label="Vertical" onChange={handleBooleanChange(setVertical)} />
            <VariantSelect onChange={setVariant} variant={variant} />
            <TextAlignmentSelect align={alignText} onChange={setAlignText} />
            <SizeSelect onChange={setSize} size={size} />
            <IntentSelect intent={intent} label={intentLabelInfo} onChange={setIntent} />
            <H5>Example</H5>
            <Switch checked={iconOnly} label="Icons only" onChange={handleBooleanChange(setIconOnly)} />
        </>
    );

    return (
        <Example options={options} {...props}>
            <ButtonGroup
                alignText={alignText}
                fill={fill}
                variant={variant}
                vertical={vertical}
                size={size}
                // set `minWidth` so `alignText` will have an effect when vertical
                style={{ minWidth: 200 }}
            >
                <Button icon={IconNames.DATABASE} intent={intent} text={iconOnly ? undefined : "Queries"} />
                <Button icon={IconNames.FUNCTION} intent={intent} text={iconOnly ? undefined : "Functions"} />
                <AnchorButton
                    endIcon={IconNames.SETTINGS}
                    icon={IconNames.COG}
                    intent={intent}
                    text={iconOnly ? undefined : "Options"}
                />
            </ButtonGroup>
        </Example>
    );
};

const intentLabelInfo = (
    <Tooltip
        content={
            <span className={Classes.TEXT_SMALL}>
                Intents are set individually on each button <br />
                in the group, not the ButtonGroup wrapper.
            </span>
        }
        placement="top"
        minimal={true}
    >
        <span>
            Intent{" "}
            <span style={{ lineHeight: 1, marginLeft: 2, verticalAlign: "top" }}>
                <Icon className={Classes.TEXT_MUTED} icon={IconNames.INFO_SIGN} size={12} />
            </span>
        </span>
    </Tooltip>
);
