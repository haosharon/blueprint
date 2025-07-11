/* !
 * (c) Copyright 2024 Palantir Technologies Inc. All rights reserved.
 */

import dedent from "dedent";
import * as React from "react";

import { AnchorButton, Button, Icon, Tooltip } from "@blueprintjs/core";
import { CodeExample, type ExampleProps } from "@blueprintjs/docs-theme";

/* eslint-disable @typescript-eslint/no-deprecated */

export const ButtonBasicExample: React.FC<ExampleProps> = props => {
    const code = `<Button text="Click Me" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Click Me" />
        </CodeExample>
    );
};

export const ButtonIntentExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Primary" intent="primary" />
        <Button text="Success" intent="success" />
        <Button text="Warning" intent="warning" />
        <Button text="Danger" intent="danger" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Primary" intent="primary" />
            <Button text="Success" intent="success" />
            <Button text="Warning" intent="warning" />
            <Button text="Danger" intent="danger" />
        </CodeExample>
    );
};

export const ButtonVariantExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Default" />
        <Button text="Minimal" variant="minimal" />
        <Button text="Outlined" variant="outlined" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Default" />
            <Button text="Minimal" variant="minimal" />
            <Button text="Outlined" variant="outlined" />
        </CodeExample>
    );
};

export const ButtonMinimalExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Minimal" minimal={true} />
        <Button text="Primary" minimal={true} intent="primary" />
        <Button text="Disabled" minimal={true} disabled={true} />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Minimal" minimal={true} />
            <Button text="Primary" minimal={true} intent="primary" />
            <Button text="Disabled" minimal={true} disabled={true} />
        </CodeExample>
    );
};

export const ButtonOutlinedExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Outlined" outlined={true} />
        <Button text="Primary" outlined={true} intent="primary" />
        <Button text="Disabled" outlined={true} disabled={true} />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Outlined" outlined={true} />
            <Button text="Primary" outlined={true} intent="primary" />
            <Button text="Disabled" outlined={true} disabled={true} />
        </CodeExample>
    );
};

export const ButtonSizeExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Small" size="small"/>
        <Button text="Medium" size="medium" />
        <Button text="Large" size="large" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Small" size="small" />
            <Button text="Medium" size="medium" />
            <Button text="Large" size="large" />
        </CodeExample>
    );
};

export const ButtonFillExample: React.FC<ExampleProps> = props => {
    const code = `<Button text="Full Width Button" fill={true} />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Full Width Button" fill={true} />
        </CodeExample>
    );
};

export const ButtonAlignTextExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Start" alignText="start" icon="align-left" endIcon="caret-down" />
        <Button text="Center" alignText="center" icon="align-center" endIcon="caret-down" />
        <Button text="End" alignText="end" icon="align-right" endIcon="caret-down" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Start" alignText="start" icon="align-left" endIcon="caret-down" />
            <Button text="Center" alignText="center" icon="align-center" endIcon="caret-down" />
            <Button text="End" alignText="end" icon="align-right" endIcon="caret-down" />
        </CodeExample>
    );
};

export const ButtonEllipsizeTextExample: React.FC<ExampleProps> = props => {
    const code = `<Button text="This is a very long button label that will be truncated" ellipsizeText={true} />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="This is a very long button label that will be truncated" ellipsizeText={true} />
        </CodeExample>
    );
};

export const ButtonIconWithTextExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button icon="refresh" intent="danger" text="Reset" />
        <Button icon="user" endIcon="caret-down" text="Profile settings" />
        <Button endIcon="arrow-right" intent="success" text="Next step" />
        <Button>
            <Icon icon="document" /> Upload... <Icon icon="small-cross" />
        </Button>`;
    return (
        <CodeExample code={code} {...props}>
            <Button icon="refresh" intent="danger" text="Reset" />
            <Button icon="user" endIcon="caret-down" text="Profile settings" />
            <Button endIcon="arrow-right" intent="success" text="Next step" />
            <Button>
                <Icon icon="document" /> Upload... <Icon icon="small-cross" />
            </Button>
        </CodeExample>
    );
};

export const ButtonIconExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button icon="edit" aria-label="edit" />
        <Button icon="share" variant="outlined" aria-label="share" />
        <Button icon="filter" intent="primary" variant="minimal" aria-label="filter" />
        <Button icon="add" intent="success" aria-label="add" />
        <Button icon="trash" disabled={true} intent="danger" aria-label="delete" />`;
    return (
        <CodeExample code={code} {...props}>
            <Button icon="edit" aria-label="edit" />
            <Button icon="share" variant="outlined" aria-label="share" />
            <Button icon="filter" intent="primary" variant="minimal" aria-label="filter" />
            <Button icon="add" intent="success" aria-label="add" />
            <Button icon="trash" disabled={true} intent="danger" aria-label="delete" />
        </CodeExample>
    );
};

export const ButtonStatesExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Button text="Default" />
        <Button text="Active" active={true} />
        <Button text="Disabled" disabled={true} />
        <Button text="Loading..." loading={true} />`;
    return (
        <CodeExample code={code} {...props}>
            <Button text="Default" />
            <Button text="Active" active={true} />
            <Button text="Disabled" disabled={true} />
            <Button text="Loading..." loading={true} />
        </CodeExample>
    );
};

export const ButtonAnchorButtonExample: React.FC<ExampleProps> = props => {
    const code = `<AnchorButton href="https://blueprintjs.com" endIcon="share" text="Link" />`;
    return (
        <CodeExample code={code} {...props}>
            <AnchorButton href="https://blueprintjs.com" endIcon="share" text="Link" />
        </CodeExample>
    );
};

export const ButtonDisabledButtonTooltipExample: React.FC<ExampleProps> = props => {
    const code = dedent`
        <Tooltip content="This button is disabled">
            <AnchorButton text="Disabled" disabled={true} />
        </Tooltip>`;
    return (
        <CodeExample code={code} {...props}>
            <Tooltip content="This button is disabled">
                <AnchorButton text="Disabled" disabled={true} />
            </Tooltip>
        </CodeExample>
    );
};
