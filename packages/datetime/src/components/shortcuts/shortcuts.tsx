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

import { Menu, MenuItem } from "@blueprintjs/core";

import { Classes, type DateRange, type TimePrecision } from "../../common";
import { clone, isDayRangeInRange } from "../../common/dateUtils";

export interface DateShortcutBase {
    /** Shortcut label that appears in the list. */
    label: string;

    /**
     * Set this prop to `true` to allow this shortcut to change the selected
     * times as well as the dates. By default, time components of a shortcut are
     * ignored; clicking a shortcut takes the date components of the `dateRange`
     * and combines them with the currently selected time.
     *
     * @default false
     */
    includeTime?: boolean;
}

export interface DateRangeShortcut extends DateShortcutBase {
    /**
     * Date range represented by this shortcut. Note that time components of a
     * shortcut are ignored by default; set `includeTime: true` to respect them.
     */
    dateRange: DateRange;
}

export interface DatePickerShortcut extends DateShortcutBase {
    /**
     * Date represented by this shortcut. Note that time components of a
     * shortcut are ignored by default; set `includeTime: true` to respect them.
     */
    date: Date;
}

export interface DatePickerShortcutMenuProps {
    allowSingleDayRange?: boolean;
    minDate: Date;
    maxDate: Date;
    shortcuts: DateRangeShortcut[] | true;
    timePrecision: TimePrecision | undefined;
    selectedShortcutIndex?: number;
    onShortcutClick: (shortcut: DateRangeShortcut, index: number) => void;
    /**
     * The DatePicker component reuses this component for a single date.
     * This changes the default shortcut labels and affects which shortcuts are used.
     *
     * @default false
     */
    useSingleDateShortcuts?: boolean;
}

/**
 * Menu of {@link DateRangeShortcut} items, typically displayed in the UI to the left of a day picker calendar.
 *
 * This component may be used for single date pickers as well as range pickers by toggling the
 * `useSingleDateShortcuts` option.
 */
export const DatePickerShortcutMenu: React.FC<DatePickerShortcutMenuProps> = props => {
    const {
        allowSingleDayRange = false,
        maxDate,
        minDate,
        onShortcutClick,
        selectedShortcutIndex = -1,
        timePrecision,
        useSingleDateShortcuts = false,
    } = props;

    const shortcuts =
        props.shortcuts === true
            ? createDefaultShortcuts(allowSingleDayRange, timePrecision != null, useSingleDateShortcuts)
            : props.shortcuts;

    return (
        <Menu aria-label="Date picker shortcuts" className={Classes.DATERANGEPICKER_SHORTCUTS} tabIndex={0}>
            {shortcuts.map((shortcut, index) => (
                <ShortcutMenuItem
                    key={index}
                    active={selectedShortcutIndex === index}
                    index={index}
                    maxDate={maxDate}
                    minDate={minDate}
                    onShortcutClick={onShortcutClick}
                    shortcut={shortcut}
                />
            ))}
        </Menu>
    );
};

interface ShortcutMenuItemProps {
    active: boolean;
    index: number;
    maxDate: DatePickerShortcutMenuProps["maxDate"];
    minDate: DatePickerShortcutMenuProps["minDate"];
    onShortcutClick: DatePickerShortcutMenuProps["onShortcutClick"];
    shortcut: DateRangeShortcut;
}

const ShortcutMenuItem: React.FC<ShortcutMenuItemProps> = props => {
    const { active, index, maxDate, minDate, onShortcutClick, shortcut } = props;

    const isShortcutInRange = isDayRangeInRange(shortcut.dateRange, [minDate, maxDate]);

    const handleClick = React.useCallback(() => onShortcutClick(shortcut, index), [index, onShortcutClick, shortcut]);

    return (
        <MenuItem
            active={active}
            disabled={!isShortcutInRange}
            onClick={handleClick}
            shouldDismissPopover={false}
            text={shortcut.label}
        />
    );
};

function createShortcut(label: string, dateRange: DateRange): DateRangeShortcut {
    return { dateRange, label };
}

function createDefaultShortcuts(
    allowSingleDayRange: boolean,
    hasTimePrecision: boolean,
    useSingleDateShortcuts: boolean,
) {
    const today = new Date();
    const makeDate = (action: (d: Date) => void) => {
        const returnVal = clone(today);
        action(returnVal);
        returnVal.setDate(returnVal.getDate() + 1);
        return returnVal;
    };

    const tomorrow = makeDate(() => null);
    const yesterday = makeDate(d => d.setDate(d.getDate() - 2));
    const oneWeekAgo = makeDate(d => d.setDate(d.getDate() - 7));
    const oneMonthAgo = makeDate(d => d.setMonth(d.getMonth() - 1));
    const threeMonthsAgo = makeDate(d => d.setMonth(d.getMonth() - 3));
    const sixMonthsAgo = makeDate(d => d.setMonth(d.getMonth() - 6));
    const oneYearAgo = makeDate(d => d.setFullYear(d.getFullYear() - 1));
    const twoYearsAgo = makeDate(d => d.setFullYear(d.getFullYear() - 2));

    const singleDayShortcuts =
        allowSingleDayRange || useSingleDateShortcuts
            ? [
                  createShortcut("Today", [today, hasTimePrecision ? tomorrow : today]),
                  createShortcut("Yesterday", [yesterday, hasTimePrecision ? today : yesterday]),
              ]
            : [];

    return [
        ...singleDayShortcuts,
        createShortcut(useSingleDateShortcuts ? "1 week ago" : "Past week", [oneWeekAgo, today]),
        createShortcut(useSingleDateShortcuts ? "1 month ago" : "Past month", [oneMonthAgo, today]),
        createShortcut(useSingleDateShortcuts ? "3 months ago" : "Past 3 months", [threeMonthsAgo, today]),
        // Don't include a couple of these for the single date shortcut
        ...(useSingleDateShortcuts ? [] : [createShortcut("Past 6 months", [sixMonthsAgo, today])]),
        createShortcut(useSingleDateShortcuts ? "1 year ago" : "Past year", [oneYearAgo, today]),
        ...(useSingleDateShortcuts ? [] : [createShortcut("Past 2 years", [twoYearsAgo, today])]),
    ];
}
