/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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

import { Card, H4, Icon, type IconName } from "@blueprintjs/core";

export class Welcome extends React.PureComponent {
    public render() {
        return (
            <div className="blueprint-welcome">
                <WelcomeCard href="#blueprint/getting-started" icon="star" title="Getting started" sameTab={true} />
                <WelcomeCard href="https://github.com/palantir/blueprint" icon="git-repo" title="Git repository" />
                <WelcomeCard
                    href="https://codesandbox.io/p/sandbox/blueprint-v6-react-18-template-lc69nt"
                    icon="code-block"
                    title="Code Sandbox"
                />
                <WelcomeCard
                    href="https://github.com/palantir/blueprint#contributing"
                    icon="git-merge"
                    title="Contributing"
                />
            </div>
        );
    }
}

const WelcomeCard: React.FC<{
    children?: React.ReactNode;
    icon: IconName;
    title: string;
    href: string;
    sameTab?: boolean;
}> = props => (
    <a className="blueprint-welcome-card" href={props.href} target={props.sameTab ? "" : "_blank"}>
        <Card interactive={true}>
            <Icon icon={props.icon} size={40} />
            <H4>{props.title}</H4>
            {props.children}
        </Card>
    </a>
);
