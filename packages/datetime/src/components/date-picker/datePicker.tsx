/*
 * Copyright 2023 Palantir Technologies, Inc. All rights reserved.
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
import { format } from "date-fns";
import * as React from "react";
import { type ActiveModifiers, type DateFormatter, DayPicker } from "react-day-picker";

import { Button, DISPLAYNAME_PREFIX, Divider } from "@blueprintjs/core";

import { Classes, type DateRange, DateUtils, Errors, TimezoneUtils } from "../../common";
import { dayPickerClassNameOverrides } from "../../common/classes";
import { DateFnsLocalizedComponent } from "../dateFnsLocalizedComponent";
import { DatePickerDropdown } from "../react-day-picker/datePickerDropdown";
import { IconLeft, IconRight } from "../react-day-picker/datePickerNavIcons";
import { DatePickerShortcutMenu, type DateRangeShortcut } from "../shortcuts/shortcuts";
import { TimePicker } from "../time-picker/timePicker";

import { DatePickerProvider } from "./datePickerContext";
import type { DatePickerProps } from "./datePickerProps";
import type { DatePickerState } from "./datePickerState";
import { DatePickerUtils } from "./datePickerUtils";

export type { DatePickerProps };

/**
 * Date picker component.
 *
 * @see https://blueprintjs.com/docs/#datetime/date-picker
 */
export class DatePicker extends DateFnsLocalizedComponent<DatePickerProps, DatePickerState> {
    public static defaultProps: DatePickerProps = {
        canClearSelection: true,
        clearButtonText: "Clear",
        dayPickerProps: {},
        highlightCurrentDay: false,
        locale: "en-US",
        maxDate: DatePickerUtils.getDefaultMaxDate(),
        minDate: DatePickerUtils.getDefaultMinDate(),
        reverseMonthAndYearMenus: false,
        shortcuts: false,
        showActionsBar: false,
        todayButtonText: "Today",
    };

    public static displayName = `${DISPLAYNAME_PREFIX}.DatePicker`;

    private ignoreNextMonthChange = false;

    public constructor(props: DatePickerProps) {
        super(props);
        const value = getInitialValue(props);
        const initialMonth = getInitialMonth(props, value);
        this.state = {
            displayMonth: initialMonth.getMonth(),
            displayYear: initialMonth.getFullYear(),
            locale: undefined,
            selectedDay: value == null ? null : value.getDate(),
            selectedShortcutIndex:
                this.props.selectedShortcutIndex !== undefined ? this.props.selectedShortcutIndex : -1,
            value,
        };
    }

    public render() {
        const { className, dayPickerProps, footerElement, maxDate, minDate, showActionsBar } = this.props;
        const { displayMonth, displayYear, locale } = this.state;

        return (
            <div
                className={classNames(Classes.DATEPICKER, className, {
                    [Classes.DATEPICKER3_HIGHLIGHT_CURRENT_DAY]: this.props.highlightCurrentDay,
                    [Classes.DATEPICKER3_REVERSE_MONTH_AND_YEAR]: this.props.reverseMonthAndYearMenus,
                })}
            >
                {this.maybeRenderShortcuts()}
                <div className={Classes.DATEPICKER_CONTENT}>
                    <DatePickerProvider {...this.props} {...this.state}>
                        <DayPicker
                            locale={locale}
                            showOutsideDays={true}
                            {...dayPickerProps}
                            captionLayout="dropdown-buttons"
                            classNames={{
                                ...dayPickerClassNameOverrides,
                                ...dayPickerProps?.classNames,
                            }}
                            components={{
                                Dropdown: DatePickerDropdown,
                                IconLeft,
                                IconRight,
                                ...dayPickerProps?.components,
                            }}
                            formatters={{
                                formatWeekdayName: this.renderWeekdayName,
                                ...dayPickerProps?.formatters,
                            }}
                            fromDate={minDate}
                            mode="single"
                            month={new Date(displayYear, displayMonth)}
                            onMonthChange={this.handleMonthChange}
                            onSelect={this.handleDaySelect}
                            required={!this.props.canClearSelection}
                            selected={this.state.value ?? undefined}
                            toDate={maxDate}
                        />
                        {this.maybeRenderTimePicker()}
                        {showActionsBar && this.renderOptionsBar()}
                        {footerElement}
                    </DatePickerProvider>
                </div>
            </div>
        );
    }

    public async componentDidMount() {
        await super.componentDidMount();
    }

    public async componentDidUpdate(prevProps: DatePickerProps) {
        super.componentDidUpdate(prevProps);

        if (this.props.value !== prevProps.value) {
            if (this.props.value == null) {
                // clear the value
                this.setState({ value: null });
            } else {
                this.setState({
                    displayMonth: this.props.value.getMonth(),
                    displayYear: this.props.value.getFullYear(),
                    selectedDay: this.props.value.getDate(),
                    value: this.props.value,
                });
            }
        }

        if (this.props.selectedShortcutIndex !== prevProps.selectedShortcutIndex) {
            this.setState({ selectedShortcutIndex: this.props.selectedShortcutIndex });
        }
    }

    protected validateProps(props: DatePickerProps) {
        const { defaultValue, initialMonth, maxDate, minDate, value } = props;
        if (defaultValue != null && !DateUtils.isDayInRange(defaultValue, [minDate!, maxDate!])) {
            console.error(Errors.DATEPICKER_DEFAULT_VALUE_INVALID);
        }

        if (initialMonth != null && !DateUtils.isMonthInRange(initialMonth, [minDate!, maxDate!])) {
            console.error(Errors.DATEPICKER_INITIAL_MONTH_INVALID);
        }

        if (maxDate != null && minDate != null && maxDate < minDate && !DateUtils.isSameDay(maxDate, minDate)) {
            console.error(Errors.DATEPICKER_MAX_DATE_INVALID);
        }

        if (value != null && !DateUtils.isDayInRange(value, [minDate!, maxDate!])) {
            console.error(Errors.DATEPICKER_VALUE_INVALID);
        }
    }

    /**
     * Custom formatter to render weekday names in the calendar header. The default formatter generally works fine,
     * but it was returning CAPITALIZED strings for some reason, while we prefer Title Case.
     */
    private renderWeekdayName: DateFormatter = date => {
        return format(date, "EEEEEE", { locale: this.state.locale });
    };

    private renderOptionsBar() {
        const { clearButtonText, todayButtonText, minDate, maxDate, canClearSelection } = this.props;
        const todayEnabled = isTodayEnabled(minDate!, maxDate!);
        return [
            <Divider key="div" />,
            <div className={Classes.DATEPICKER_FOOTER} key="footer">
                <Button
                    disabled={!todayEnabled}
                    onClick={this.handleTodayClick}
                    text={todayButtonText}
                    variant="minimal"
                />
                <Button
                    disabled={!canClearSelection}
                    onClick={this.handleClearClick}
                    text={clearButtonText}
                    variant="minimal"
                />
            </div>,
        ];
    }

    private maybeRenderTimePicker() {
        const { timePrecision, timePickerProps, minDate, maxDate } = this.props;
        if (timePrecision == null && timePickerProps === undefined) {
            return null;
        }
        const applyMin = this.state.value != null && DateUtils.isSameDay(this.state.value, minDate!);
        const applyMax = this.state.value != null && DateUtils.isSameDay(this.state.value, maxDate!);
        return (
            <div className={Classes.DATEPICKER_TIMEPICKER_WRAPPER}>
                <TimePicker
                    precision={timePrecision}
                    minTime={applyMin ? minDate : undefined}
                    maxTime={applyMax ? maxDate : undefined}
                    {...timePickerProps}
                    onChange={this.handleTimeChange}
                    value={this.state.value}
                />
            </div>
        );
    }

    private maybeRenderShortcuts() {
        const { shortcuts } = this.props;
        if (shortcuts == null || shortcuts === false) {
            return null;
        }

        const { selectedShortcutIndex } = this.state;
        const {
            maxDate = DatePickerUtils.getDefaultMaxDate(),
            minDate = DatePickerUtils.getDefaultMinDate(),
            timePrecision,
        } = this.props;
        // Reuse the existing date range shortcuts and only care about start date
        const dateRangeShortcuts: DateRangeShortcut[] | true =
            shortcuts === true
                ? true
                : shortcuts.map(shortcut => ({
                      ...shortcut,
                      // TODO: Remove cast after setting "strictNullChecks: true"
                      dateRange: [shortcut.date, null] as [Date, null],
                  }));
        return [
            <DatePickerShortcutMenu
                key="shortcuts"
                allowSingleDayRange={true}
                maxDate={maxDate}
                minDate={minDate}
                selectedShortcutIndex={selectedShortcutIndex}
                shortcuts={dateRangeShortcuts}
                timePrecision={timePrecision}
                onShortcutClick={this.handleShortcutClick}
                useSingleDateShortcuts={true}
            />,
            <Divider key="div" />,
        ];
    }

    private handleDaySelect = (
        day: Date | undefined,
        selectedDay: Date,
        activeModifiers: ActiveModifiers,
        e: React.MouseEvent,
    ) => {
        if (activeModifiers.disabled) {
            return;
        } else if (day === undefined) {
            this.handleClearClick();
            return;
        }

        this.updateDay(day);
        this.props.dayPickerProps?.onSelect?.(day, selectedDay, activeModifiers, e);

        // allow toggling selected date by clicking it again (if prop enabled)
        const newValue =
            this.props.canClearSelection && activeModifiers.selected
                ? null
                : DateUtils.getDateTime(day, this.state.value);
        this.updateValue(newValue, true);
    };

    private handleShortcutClick = (shortcut: DateRangeShortcut, selectedShortcutIndex: number) => {
        const { onShortcutChange, selectedShortcutIndex: currentShortcutIndex } = this.props;
        const { dateRange, includeTime } = shortcut;

        const newDate = dateRange[0];
        const newValue = includeTime ? newDate : DateUtils.getDateTime(newDate, this.state.value);

        if (newDate == null) {
            return;
        }

        this.updateDay(newDate);
        this.updateValue(newValue, true);

        if (currentShortcutIndex === undefined) {
            this.setState({ selectedShortcutIndex });
        }

        const datePickerShortcut = { ...shortcut, date: newDate };
        onShortcutChange?.(datePickerShortcut, selectedShortcutIndex);
    };

    private updateDay = (day: Date) => {
        if (this.props.value === undefined) {
            // set now if uncontrolled, otherwise they'll be updated in `componentDidUpdate`
            this.setState({
                displayMonth: day.getMonth(),
                displayYear: day.getFullYear(),
                selectedDay: day.getDate(),
            });
        }
        if (this.state.value != null && this.state.value.getMonth() !== day.getMonth()) {
            this.ignoreNextMonthChange = true;
        }
    };

    private computeValidDateInSpecifiedMonthYear(displayYear: number, displayMonth: number): Date | null {
        const { minDate, maxDate } = this.props;
        const { selectedDay } = this.state;
        // month is 0-based, date is 1-based. date 0 is last day of previous month.
        const maxDaysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
        const displayDate = selectedDay == null ? 1 : Math.min(selectedDay, maxDaysInMonth);

        // 12:00 matches the underlying react-day-picker timestamp behavior
        const value = DateUtils.getDateTime(new Date(displayYear, displayMonth, displayDate, 12), this.state.value);
        // clamp between min and max dates
        if (value != null && value < minDate!) {
            return minDate!;
        } else if (value != null && value > maxDate!) {
            return maxDate!;
        }
        return value;
    }

    private handleClearClick = () => this.updateValue(null, true);

    private handleMonthChange = (newDate: Date) => {
        const date = this.computeValidDateInSpecifiedMonthYear(newDate.getFullYear(), newDate.getMonth());
        if (date != null) {
            this.setState({ displayMonth: date.getMonth(), displayYear: date.getFullYear() });
            this.props.dayPickerProps?.onMonthChange?.(date);
        }
        if (this.state.value !== null) {
            // if handleDayClick just got run (so this flag is set), then the
            // user selected a date in a new month, so don't invoke onChange a
            // second time
            this.updateValue(date, false, this.ignoreNextMonthChange);
            this.ignoreNextMonthChange = false;
        }
    };

    private handleTodayClick = () => {
        const { timezone } = this.props;
        const today = new Date();
        const value = timezone != null ? TimezoneUtils.convertLocalDateToTimezoneTime(today, timezone) : today;
        const displayMonth = value.getMonth();
        const displayYear = value.getFullYear();
        const selectedDay = value.getDate();
        this.setState({ displayMonth, displayYear, selectedDay });
        this.updateValue(value, true);
    };

    private handleTimeChange = (time: Date) => {
        this.props.timePickerProps?.onChange?.(time);
        const { value } = this.state;
        const newValue = DateUtils.getDateTime(value != null ? value : new Date(), time);
        this.updateValue(newValue, true);
    };

    /**
     * Update `value` by invoking `onChange` (always) and setting state (if uncontrolled).
     */
    private updateValue(value: Date | null, isUserChange: boolean, skipOnChange = false) {
        if (!skipOnChange) {
            this.props.onChange?.(value, isUserChange);
        }
        if (this.props.value === undefined) {
            this.setState({ value });
        }
    }
}

function getInitialValue(props: DatePickerProps): Date | null {
    // !== because `null` is a valid value (no date)
    if (props.value !== undefined) {
        return props.value;
    }
    if (props.defaultValue !== undefined) {
        return props.defaultValue;
    }
    return null;
}

function getInitialMonth(props: DatePickerProps, value: Date | null): Date {
    const rangeFromProps: DateRange = [props.minDate ?? null, props.maxDate ?? null];
    const today = new Date();
    // != because we must have a real `Date` to begin the calendar on.
    if (props.initialMonth != null) {
        return props.initialMonth;
    } else if (value != null) {
        return value;
    } else if (DateUtils.isDayInRange(today, rangeFromProps)) {
        return today;
    } else {
        return DateUtils.getDateBetween(rangeFromProps);
    }
}

function isTodayEnabled(minDate: Date, maxDate: Date): boolean {
    const today = new Date();
    return DateUtils.isDayInRange(today, [minDate, maxDate]);
}
