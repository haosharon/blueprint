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

import classNames from "classnames";
import * as React from "react";

import { Classes } from "../../common";
import type { HotkeyConfig } from "../../hooks";
import { Dialog, type DialogProps } from "../dialog/dialog";
import { DialogBody } from "../dialog/dialogBody";

import { Hotkey } from "./hotkey";
import { Hotkeys } from "./hotkeys";

export interface HotkeysDialogProps extends DialogProps {
    /**
     * This string displayed as the group name in the hotkeys dialog for all
     * global hotkeys.
     */
    globalGroupName?: string;

    hotkeys: readonly HotkeyConfig[];
}

export const HotkeysDialog: React.FC<HotkeysDialogProps> = ({ globalGroupName = "Global", hotkeys, ...props }) => {
    return (
        <Dialog {...props} className={classNames(Classes.HOTKEY_DIALOG, props.className)}>
            <DialogBody>
                <Hotkeys>
                    {hotkeys.map((hotkey, index) => (
                        <Hotkey
                            key={index}
                            {...hotkey}
                            group={hotkey.global === true && hotkey.group == null ? globalGroupName : hotkey.group}
                        />
                    ))}
                </Hotkeys>
            </DialogBody>
        </Dialog>
    );
};
