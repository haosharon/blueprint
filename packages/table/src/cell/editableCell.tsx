/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
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

import {
    Utils as CoreUtils,
    DISPLAYNAME_PREFIX,
    EditableText,
    type EditableTextProps,
    type HotkeyConfig,
    HotkeysTarget,
    type UseHotkeysReturnValue,
} from "@blueprintjs/core";

import * as Classes from "../common/classes";
import { Draggable } from "../interactions/draggable";

import { Cell, type CellProps } from "./cell";

export interface EditableCellProps extends Omit<CellProps, "onKeyDown" | "onKeyUp"> {
    /**
     * Whether the given cell is the current active/focused cell.
     */
    isFocused?: boolean;

    /**
     * The value displayed in the text box. Be sure to update this value when
     * rendering this component after a confirmed change.
     */
    value?: string;

    /**
     * A listener that is triggered if the user cancels the edit. This is
     * important to listen to if you are doing anything with `onChange` events,
     * since you'll likely want to revert whatever changes you made. The
     * callback will also receive the row index and column index if they were
     * originally provided via props.
     */
    onCancel?: (value: string, rowIndex?: number, columnIndex?: number) => void;

    /**
     * A listener that is triggered as soon as the editable name is modified.
     * This can be due, for example, to keyboard input or the clipboard. The
     * callback will also receive the row index and column index if they were
     * originally provided via props.
     */
    onChange?: (value: string, rowIndex?: number, columnIndex?: number) => void;

    /**
     * A listener that is triggered once the editing is confirmed. This is
     * usually due to the <code>return</code> (or <code>enter</code>) key press.
     * The callback will also receive the row index and column index if they
     * were originally provided via props.
     */
    onConfirm?: (value: string, rowIndex?: number, columnIndex?: number) => void;

    /**
     * Props that should be passed to the EditableText when it is used to edit
     */
    editableTextProps?: Omit<EditableTextProps, "elementRef">;
}

export interface EditableCellState {
    isEditing?: boolean;
    savedValue?: string;
    dirtyValue?: string;
}

/**
 * Editable cell component.
 *
 * @see https://blueprintjs.com/docs/#table/api.editablecell
 */
export class EditableCell extends React.Component<EditableCellProps, EditableCellState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.EditableCell`;

    public static defaultProps = {
        truncated: true,
        wrapText: false,
    };

    private cellRef = React.createRef<HTMLDivElement>();

    private contentsRef = React.createRef<HTMLDivElement>();

    public state: EditableCellState = {
        isEditing: false,
        savedValue: this.props.value,
    };

    public componentDidMount() {
        this.checkShouldFocus();
    }

    public componentDidUpdate(prevProps: EditableCellProps) {
        const didPropsChange =
            !CoreUtils.shallowCompareKeys(this.props, prevProps, { exclude: ["style"] }) ||
            !CoreUtils.deepCompareKeys(this.props, prevProps, ["style"]);

        const { value } = this.props;
        if (didPropsChange && value != null) {
            this.setState({ dirtyValue: value, savedValue: value });
        }

        this.checkShouldFocus();
    }

    public shouldComponentUpdate(nextProps: EditableCellProps, nextState: EditableCellState) {
        return (
            !CoreUtils.shallowCompareKeys(this.props, nextProps, { exclude: ["style"] }) ||
            !CoreUtils.shallowCompareKeys(this.state, nextState) ||
            !CoreUtils.deepCompareKeys(this.props, nextProps, ["style"])
        );
    }

    public render() {
        return <HotkeysTarget hotkeys={this.hotkeys}>{this.renderCell}</HotkeysTarget>;
    }

    private renderCell = ({ handleKeyDown, handleKeyUp }: UseHotkeysReturnValue) => {
        const {
            editableTextProps,
            onCancel,
            onChange,
            onConfirm,
            tabIndex = 0,
            truncated,
            wrapText,
            ...spreadableProps
        } = this.props;

        const { isEditing, dirtyValue, savedValue } = this.state;
        const interactive = spreadableProps.interactive || isEditing;

        let cellContents: React.JSX.Element | undefined;
        if (isEditing) {
            const className = editableTextProps ? editableTextProps.className : null;
            cellContents = (
                <EditableText
                    {...editableTextProps}
                    isEditing={true}
                    className={classNames(Classes.TABLE_EDITABLE_TEXT, Classes.TABLE_EDITABLE_NAME, className)}
                    elementRef={this.contentsRef}
                    intent={spreadableProps.intent}
                    minWidth={0}
                    onCancel={this.handleCancel}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onEdit={this.handleEdit}
                    placeholder=""
                    selectAllOnFocus={false}
                    value={dirtyValue}
                />
            );
        } else {
            const textClasses = classNames(Classes.TABLE_EDITABLE_TEXT, {
                [Classes.TABLE_TRUNCATED_TEXT]: truncated,
                [Classes.TABLE_NO_WRAP_TEXT]: !wrapText,
            });

            cellContents = (
                <div className={textClasses} ref={this.contentsRef}>
                    {savedValue}
                </div>
            );
        }

        return (
            <Cell
                {...spreadableProps}
                wrapText={wrapText}
                truncated={false}
                interactive={interactive}
                cellRef={this.cellRef}
                onKeyDown={handleKeyDown}
                onKeyPress={this.handleKeyPress}
                onKeyUp={handleKeyUp}
                tabIndex={tabIndex}
            >
                <Draggable
                    onActivate={this.handleCellActivate}
                    onDoubleClick={this.handleCellDoubleClick}
                    preventDefault={false}
                    stopPropagation={interactive}
                    targetRef={this.contentsRef}
                >
                    {cellContents}
                </Draggable>
            </Cell>
        );
    };

    private checkShouldFocus() {
        if (this.props.isFocused && !this.state.isEditing) {
            // don't focus if we're editing -- we'll lose the fact that we're editing
            this.cellRef.current?.focus();
        }
    }

    private handleKeyPress = () => {
        if (this.state.isEditing || !this.props.isFocused) {
            return;
        }
        // setting dirty value to empty string because apparently the text field will pick up the key and write it in there
        this.setState({ dirtyValue: "", isEditing: true, savedValue: this.state.savedValue });
    };

    private handleEdit = () => {
        this.setState({ dirtyValue: this.state.savedValue, isEditing: true });
    };

    private handleCancel = (value: string) => {
        // don't strictly need to clear the dirtyValue, but it's better hygiene
        this.setState({ dirtyValue: undefined, isEditing: false });
        this.invokeCallback(this.props.onCancel, value);
    };

    private handleChange = (value: string) => {
        this.setState({ dirtyValue: value });
        this.invokeCallback(this.props.onChange, value);
    };

    private handleConfirm = (value: string) => {
        this.setState({ dirtyValue: undefined, isEditing: false, savedValue: value });
        this.invokeCallback(this.props.onConfirm, value);
    };

    private invokeCallback(
        callback: ((value: string, rowIndex?: number, columnIndex?: number) => void) | undefined,
        value: string,
    ) {
        // pass through the row and column indices if they were provided as props by the consumer
        const { rowIndex, columnIndex } = this.props;
        callback?.(value, rowIndex, columnIndex);
    }

    private handleCellActivate = (_event: MouseEvent) => {
        return true;
    };

    private handleCellDoubleClick = (_event: MouseEvent) => {
        this.handleEdit();
    };

    private hotkeys: HotkeyConfig[] = [
        {
            combo: "f2",
            group: "Table",
            label: "Edit the currently focused cell",
            onKeyDown: this.handleEdit,
        },
    ];
}

/** @deprecated Use `EditableCell` instead */
export const EditableCell2 = EditableCell;
export type EditableCell2 = InstanceType<typeof EditableCell2>;

/** @deprecated Use `EditableCellProps` instead */
export type EditableCell2Props = EditableCellProps;
