/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
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

import {
    AbstractPureComponent,
    Button,
    type ButtonProps,
    Classes as CoreClasses,
    DISPLAYNAME_PREFIX,
    type InputGroupProps,
    MenuItem,
    type Props,
} from "@blueprintjs/core";
import { type ItemListPredicate, type ItemRenderer, Select, type SelectPopoverProps } from "@blueprintjs/select";

import { Classes, type TimezoneWithNames } from "../../common";
import { formatTimezone, TimezoneDisplayFormat } from "../../common/timezoneDisplayFormat";
import { TIMEZONE_ITEMS } from "../../common/timezoneItems";
import { getInitialTimezoneItems, mapTimezonesWithNames } from "../../common/timezoneNameUtils";

export interface TimezoneSelectProps extends Props {
    /**
     * Element which triggers the timezone select popover. If this is undefined,
     * by default the component will render a `<Button>` which shows the currently
     * selected timezone.
     */
    children?: React.ReactNode;

    /**
     * The currently selected timezone UTC identifier, e.g. "Pacific/Honolulu".
     *
     * @see https://www.iana.org/time-zones
     */
    value: string | undefined;

    /**
     * Callback invoked when the user selects a timezone.
     *
     * @param timezone the new timezone's IANA code
     */
    onChange: (timezone: string) => void;

    /**
     * The date to use when formatting timezone offsets.
     * An offset date is necessary to account for DST, but typically the default value of `now` will be sufficient.
     *
     * @default now
     */
    date?: Date;

    /**
     * Whether the component should take up the full width of its container.
     * This overrides `popoverProps.fill` and `buttonProps.fill`.
     *
     * @default false
     */
    fill?: boolean;

    /**
     * Whether this component is non-interactive.
     * This prop will be ignored if `children` is provided.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Whether to show the local timezone at the top of the list of initial timezone suggestions.
     *
     * @default false
     */
    showLocalTimezone?: boolean;

    /**
     * Text to show when no timezone has been selected (`value === undefined`).
     * This prop will be ignored if `children` is provided.
     *
     * @default "Select timezone..."
     */
    placeholder?: string;

    /**
     * Props to spread to the target `Button`.
     * This prop will be ignored if `children` is provided.
     */
    buttonProps?: Partial<ButtonProps>;

    /**
     * Props to spread to the filter `InputGroup`.
     * All props are supported except `ref` (use `inputRef` instead).
     * If you want to control the filter input, you can pass `value` and `onChange` here
     * to override `Select`'s own behavior.
     */
    inputProps?: InputGroupProps;

    /** Props to spread to the popover. Note that `content` cannot be changed. */
    popoverProps?: SelectPopoverProps["popoverProps"];

    /**
     * Format to use when displaying the selected (or default) timezone within the target element.
     * This prop will be ignored if `children` is provided.
     *
     * @default TimezoneDisplayFormat.COMPOSITE
     */
    valueDisplayFormat?: TimezoneDisplayFormat;
}

export interface TimezoneSelectState {
    query: string;
}

/**
 * Timezone select component.
 *
 * @see https://blueprintjs.com/docs/#datetime/timezone-select
 */
export class TimezoneSelect extends AbstractPureComponent<TimezoneSelectProps, TimezoneSelectState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.TimezoneSelect`;

    public static defaultProps: Partial<TimezoneSelectProps> = {
        date: new Date(),
        disabled: false,
        fill: false,
        inputProps: {},
        placeholder: "Select timezone...",
        popoverProps: {},
        showLocalTimezone: false,
    };

    private timezoneItems: TimezoneWithNames[];

    private initialTimezoneItems: TimezoneWithNames[];

    constructor(props: TimezoneSelectProps) {
        super(props);

        const { showLocalTimezone, inputProps = {}, date } = props;
        this.state = { query: inputProps.value || "" };
        this.timezoneItems = mapTimezonesWithNames(date, TIMEZONE_ITEMS);
        this.initialTimezoneItems = getInitialTimezoneItems(date, showLocalTimezone!);
    }

    public render() {
        const { children, className, disabled, fill, inputProps, popoverProps } = this.props;
        const { query } = this.state;

        return (
            <Select<TimezoneWithNames>
                className={classNames(Classes.TIMEZONE_SELECT, className)}
                disabled={disabled}
                fill={fill}
                inputProps={{
                    placeholder: "Search for timezones...",
                    ...inputProps,
                }}
                itemListPredicate={this.filterItems}
                itemRenderer={this.renderItem}
                items={query ? this.timezoneItems : this.initialTimezoneItems}
                noResults={<MenuItem disabled={true} roleStructure="listoption" text="No matching timezones." />}
                onItemSelect={this.handleItemSelect}
                onQueryChange={this.handleQueryChange}
                popoverProps={{
                    ...popoverProps,
                    popoverClassName: classNames(Classes.TIMEZONE_SELECT_POPOVER, popoverProps?.popoverClassName),
                }}
                popoverTargetProps={{ "aria-label": "timezone" }}
                resetOnClose={true}
                resetOnSelect={true}
            >
                {children ?? this.renderButton()}
            </Select>
        );
    }

    public componentDidUpdate(prevProps: TimezoneSelectProps, prevState: TimezoneSelectState) {
        super.componentDidUpdate(prevProps, prevState);
        const { date: nextDate } = this.props;

        if (this.props.showLocalTimezone !== prevProps.showLocalTimezone) {
            this.initialTimezoneItems = getInitialTimezoneItems(nextDate, this.props.showLocalTimezone!);
        }
        if (nextDate != null && nextDate.getTime() !== prevProps.date?.getTime()) {
            this.initialTimezoneItems = mapTimezonesWithNames(nextDate, this.initialTimezoneItems);
            this.timezoneItems = mapTimezonesWithNames(nextDate, this.timezoneItems);
        }
    }

    private renderButton() {
        const { buttonProps = {}, disabled, fill, placeholder, value, valueDisplayFormat } = this.props;
        const selectedTimezone = this.timezoneItems.find(tz => tz.ianaCode === value);
        const buttonContent =
            selectedTimezone !== undefined ? (
                formatTimezone(selectedTimezone, valueDisplayFormat ?? TimezoneDisplayFormat.COMPOSITE)
            ) : (
                <span className={CoreClasses.TEXT_MUTED}>{placeholder}</span>
            );
        return <Button endIcon="caret-down" disabled={disabled} text={buttonContent} fill={fill} {...buttonProps} />;
    }

    private filterItems: ItemListPredicate<TimezoneWithNames> = (query, items) => {
        // using list predicate so only one RegExp instance is needed
        // escape bad regex characters, let spaces act as any separator
        const expr = new RegExp(query.replace(/([[()+*?])/g, "\\$1").replace(" ", "[ _/\\(\\)]+"), "i");

        return items.filter(
            item =>
                expr.test(item.ianaCode) ||
                expr.test(item.label) ||
                expr.test(item.longName) ||
                expr.test(item.shortName),
        );
    };

    private renderItem: ItemRenderer<TimezoneWithNames> = (item, { handleClick, modifiers }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                key={item.ianaCode}
                selected={modifiers.active}
                text={`${item.label}, ${item.longName}`}
                onClick={handleClick}
                label={item.shortName}
            />
        );
    };

    private handleItemSelect = (timezone: TimezoneWithNames) => this.props.onChange?.(timezone.ianaCode);

    private handleQueryChange = (query: string) => this.setState({ query });
}
