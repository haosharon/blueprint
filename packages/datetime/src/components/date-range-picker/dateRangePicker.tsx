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
import { addDays, format } from "date-fns";
import * as React from "react";
import type { DateFormatter, DayModifiers, DayMouseEventHandler, ModifiersClassNames } from "react-day-picker";

import { Boundary, DISPLAYNAME_PREFIX, Divider } from "@blueprintjs/core";

import { Classes, type DateRange, DateUtils, Errors, TimePrecision } from "../../common";
import { dayPickerClassNameOverrides } from "../../common/classes";
import { DateRangeSelectionStrategy } from "../../common/dateRangeSelectionStrategy";
import { combineModifiers, HOVERED_RANGE_MODIFIER } from "../../common/dayPickerModifiers";
import { MonthAndYear } from "../../common/monthAndYear";
import { DatePickerProvider } from "../date-picker/datePickerContext";
import { DatePickerUtils } from "../date-picker/datePickerUtils";
import { DateFnsLocalizedComponent } from "../dateFnsLocalizedComponent";
import { DatePickerShortcutMenu, type DateRangeShortcut } from "../shortcuts/shortcuts";
import { TimePicker } from "../time-picker/timePicker";

import { ContiguousDayRangePicker } from "./contiguousDayRangePicker";
import type { DateRangePickerDefaultProps, DateRangePickerProps } from "./dateRangePickerProps";
import type { DateRangePickerState } from "./dateRangePickerState";
import { NonContiguousDayRangePicker } from "./nonContiguousDayRangePicker";

export type { DateRangePickerProps };

const NULL_RANGE: DateRange = [null, null];

/**
 * Date range picker component.
 *
 * @see https://blueprintjs.com/docs/#datetime/date-range-picker
 */
export class DateRangePicker extends DateFnsLocalizedComponent<DateRangePickerProps, DateRangePickerState> {
    public static defaultProps: DateRangePickerDefaultProps = {
        allowSingleDayRange: false,
        contiguousCalendarMonths: true,
        dayPickerProps: {},
        locale: "en-US",
        maxDate: DatePickerUtils.getDefaultMaxDate(),
        minDate: DatePickerUtils.getDefaultMinDate(),
        reverseMonthAndYearMenus: false,
        shortcuts: true,
        singleMonthOnly: false,
        timePickerProps: {},
    };

    public static displayName = `${DISPLAYNAME_PREFIX}.DateRangePicker`;

    // these will get merged with the user's own
    private modifiers: DayModifiers = {
        [HOVERED_RANGE_MODIFIER]: day => {
            const {
                hoverValue,
                value: [selectedStart, selectedEnd],
            } = this.state;
            if (selectedStart == null && selectedEnd == null) {
                return false;
            }
            if (hoverValue == null || hoverValue[0] == null || hoverValue[1] == null) {
                return false;
            }
            return DateUtils.isDayInRange(day, hoverValue, true);
        },
        [`${HOVERED_RANGE_MODIFIER}-start`]: day => {
            const { hoverValue } = this.state;
            if (hoverValue == null || hoverValue[0] == null) {
                return false;
            }
            return DateUtils.isSameDay(hoverValue[0], day);
        },
        [`${HOVERED_RANGE_MODIFIER}-end`]: day => {
            const { hoverValue } = this.state;
            if (hoverValue == null || hoverValue[1] == null) {
                return false;
            }
            return DateUtils.isSameDay(hoverValue[1], day);
        },
    };

    private modifiersClassNames: ModifiersClassNames = {
        [HOVERED_RANGE_MODIFIER]: Classes.DATERANGEPICKER3_HOVERED_RANGE,
        [`${HOVERED_RANGE_MODIFIER}-start`]: Classes.DATERANGEPICKER3_HOVERED_RANGE_START,
        [`${HOVERED_RANGE_MODIFIER}-end`]: Classes.DATERANGEPICKER3_HOVERED_RANGE_END,
    };

    private initialMonthAndYear: MonthAndYear =
        MonthAndYear.fromDate(new Date()) ?? new MonthAndYear(new Date().getMonth(), new Date().getFullYear());

    public constructor(props: DateRangePickerProps) {
        super(props);
        const value = getInitialValue(props);
        const time: DateRange = value;
        const initialMonth = getInitialMonth(props, value);
        this.initialMonthAndYear = new MonthAndYear(initialMonth.getMonth(), initialMonth.getFullYear());
        this.state = {
            hoverValue: NULL_RANGE,
            locale: undefined,
            selectedShortcutIndex:
                this.props.selectedShortcutIndex !== undefined ? this.props.selectedShortcutIndex : -1,
            time,
            value,
        };
    }

    public render() {
        const { className, contiguousCalendarMonths, footerElement } = this.props;
        const isSingleMonthOnly = getIsSingleMonthOnly(this.props);

        const classes = classNames(Classes.DATEPICKER, Classes.DATERANGEPICKER, className, {
            [Classes.DATEPICKER3_HIGHLIGHT_CURRENT_DAY]: this.props.highlightCurrentDay,
            [Classes.DATERANGEPICKER_CONTIGUOUS]: contiguousCalendarMonths,
            [Classes.DATERANGEPICKER_SINGLE_MONTH]: isSingleMonthOnly,
            [Classes.DATERANGEPICKER3_REVERSE_MONTH_AND_YEAR]: this.props.reverseMonthAndYearMenus,
        });

        // use the left DayPicker when we only need one
        return (
            <div className={classes}>
                {this.maybeRenderShortcuts()}
                <div className={Classes.DATEPICKER_CONTENT}>
                    <DatePickerProvider {...this.props} {...this.state}>
                        {contiguousCalendarMonths || isSingleMonthOnly
                            ? this.renderContiguousDayRangePicker(isSingleMonthOnly)
                            : this.renderNonContiguousDayRangePicker()}
                        {this.maybeRenderTimePickers(isSingleMonthOnly)}
                        {footerElement}
                    </DatePickerProvider>
                </div>
            </div>
        );
    }

    public async componentDidMount() {
        await super.componentDidMount();
    }

    public async componentDidUpdate(prevProps: DateRangePickerProps) {
        super.componentDidUpdate(prevProps);

        const isControlled = prevProps.value !== undefined && this.props.value !== undefined;

        if (prevProps.contiguousCalendarMonths !== this.props.contiguousCalendarMonths) {
            const initialMonth = getInitialMonth(this.props, getInitialValue(this.props));
            this.initialMonthAndYear = new MonthAndYear(initialMonth.getMonth(), initialMonth.getFullYear());
        }

        if (
            isControlled &&
            (!DateUtils.areRangesEqual(prevProps.value!, this.props.value!) ||
                prevProps.contiguousCalendarMonths !== this.props.contiguousCalendarMonths)
        ) {
            this.setState({ value: this.props.value ?? NULL_RANGE });
        }

        if (this.props.selectedShortcutIndex !== prevProps.selectedShortcutIndex) {
            this.setState({ selectedShortcutIndex: this.props.selectedShortcutIndex });
        }
    }

    protected validateProps(props: DateRangePickerProps) {
        const { defaultValue, initialMonth, maxDate, minDate, boundaryToModify, value } = props;
        const dateRange: DateRange = [minDate!, maxDate!];

        if (defaultValue != null && !DateUtils.isDayRangeInRange(defaultValue, dateRange)) {
            console.error(Errors.DATERANGEPICKER_DEFAULT_VALUE_INVALID);
        }

        if (initialMonth != null && !DateUtils.isMonthInRange(initialMonth, dateRange)) {
            console.error(Errors.DATERANGEPICKER_INITIAL_MONTH_INVALID);
        }

        if (maxDate != null && minDate != null && maxDate < minDate && !DateUtils.isSameDay(maxDate, minDate)) {
            console.error(Errors.DATERANGEPICKER_MAX_DATE_INVALID);
        }

        if (value != null && !DateUtils.isDayRangeInRange(value, dateRange)) {
            console.error(Errors.DATERANGEPICKER_VALUE_INVALID);
        }

        if (boundaryToModify != null && boundaryToModify !== Boundary.START && boundaryToModify !== Boundary.END) {
            console.error(Errors.DATERANGEPICKER_PREFERRED_BOUNDARY_TO_MODIFY_INVALID);
        }
    }

    private maybeRenderShortcuts() {
        const { shortcuts } = this.props;
        if (shortcuts == null || shortcuts === false) {
            return null;
        }

        const { selectedShortcutIndex } = this.state;
        const {
            allowSingleDayRange,
            maxDate = DatePickerUtils.getDefaultMaxDate(),
            minDate = DatePickerUtils.getDefaultMinDate(),
            timePrecision,
        } = this.props;
        return [
            <DatePickerShortcutMenu
                key="shortcuts"
                allowSingleDayRange={allowSingleDayRange}
                maxDate={maxDate}
                minDate={minDate}
                onShortcutClick={this.handleShortcutClick}
                selectedShortcutIndex={selectedShortcutIndex}
                shortcuts={shortcuts}
                timePrecision={timePrecision}
            />,
            <Divider key="div" />,
        ];
    }

    private maybeRenderTimePickers(isShowingOneMonth: boolean) {
        // timePrecision may be set as a root prop or as a property inside timePickerProps, so we need to check both
        const { timePickerProps, timePrecision = timePickerProps?.precision } = this.props;
        if (timePrecision == null && timePickerProps === DateRangePicker.defaultProps.timePickerProps) {
            return null;
        }

        const isLongTimePicker =
            timePickerProps?.useAmPm ||
            timePrecision === TimePrecision.SECOND ||
            timePrecision === TimePrecision.MILLISECOND;

        return (
            <div
                className={classNames(Classes.DATERANGEPICKER_TIMEPICKERS, {
                    [Classes.DATERANGEPICKER3_TIMEPICKERS_STACKED]: isShowingOneMonth && isLongTimePicker,
                })}
            >
                <TimePicker
                    precision={timePrecision}
                    {...timePickerProps}
                    onChange={this.handleTimeChangeLeftCalendar}
                    value={this.state.time[0]}
                />
                <TimePicker
                    precision={timePrecision}
                    {...timePickerProps}
                    onChange={this.handleTimeChangeRightCalendar}
                    value={this.state.time[1]}
                />
            </div>
        );
    }

    private handleTimeChange = (newTime: Date, dateIndex: number) => {
        this.props.timePickerProps?.onChange?.(newTime);

        const { value, time } = this.state;
        const newValue = DateUtils.getDateTime(
            value[dateIndex] != null ? DateUtils.clone(value[dateIndex]!) : this.getDefaultDate(dateIndex),
            newTime,
        );
        const newDateRange: DateRange = [value[0], value[1]];
        newDateRange[dateIndex] = newValue;
        const newTimeRange: DateRange = [time[0], time[1]];
        newTimeRange[dateIndex] = newTime;

        this.props.onChange?.(newDateRange);
        this.setState({ time: newTimeRange, value: newDateRange });
    };

    // When a user sets the time value before choosing a date, we need to pick a date for them
    // The default depends on the value of the other date since there's an invariant
    // that the left/0 date is always less than the right/1 date
    private getDefaultDate = (dateIndex: number) => {
        const { value } = this.state;
        const otherIndex = dateIndex === 0 ? 1 : 0;
        const otherDate = value[otherIndex];
        if (otherDate == null) {
            return new Date();
        }

        const { allowSingleDayRange } = this.props;
        if (!allowSingleDayRange) {
            const dateDiff = dateIndex === 0 ? -1 : 1;
            return addDays(otherDate, dateDiff);
        }

        return otherDate;
    };

    private handleTimeChangeLeftCalendar = (time: Date) => {
        this.handleTimeChange(time, 0);
    };

    private handleTimeChangeRightCalendar = (time: Date) => {
        this.handleTimeChange(time, 1);
    };

    /**
     * Render a standard day range picker where props.contiguousCalendarMonths is expected to be `true`.
     */
    private renderContiguousDayRangePicker(singleMonthOnly: boolean) {
        const { dayPickerProps, ...props } = this.props;
        return (
            <ContiguousDayRangePicker
                {...props}
                contiguousCalendarMonths={true}
                dayPickerEventHandlers={{
                    onDayMouseEnter: this.handleDayMouseEnter,
                    onDayMouseLeave: this.handleDayMouseLeave,
                }}
                dayPickerProps={this.resolvedDayPickerProps}
                initialMonthAndYear={this.initialMonthAndYear}
                locale={this.state.locale}
                onRangeSelect={this.handleDayRangeSelect}
                singleMonthOnly={singleMonthOnly}
                value={this.state.value}
            />
        );
    }

    /**
     * react-day-picker doesn't have built-in support for non-contiguous calendar months in its range picker,
     * so we have to implement this ourselves.
     */
    private renderNonContiguousDayRangePicker() {
        const { dayPickerProps, ...props } = this.props;
        return (
            <NonContiguousDayRangePicker
                {...props}
                dayPickerProps={this.resolvedDayPickerProps}
                dayPickerEventHandlers={{
                    onDayMouseEnter: this.handleDayMouseEnter,
                    onDayMouseLeave: this.handleDayMouseLeave,
                }}
                initialMonthAndYear={this.initialMonthAndYear}
                locale={this.state.locale}
                onRangeSelect={this.handleDayRangeSelect}
                value={this.state.value}
            />
        );
    }

    private get resolvedDayPickerProps(): DateRangePickerProps["dayPickerProps"] {
        const { dayPickerProps = {} } = this.props;
        return {
            ...dayPickerProps,
            classNames: {
                ...dayPickerClassNameOverrides,
                ...dayPickerProps.classNames,
            },
            formatters: {
                formatWeekdayName: this.formatWeekdayName,
                ...dayPickerProps.formatters,
            },
            modifiers: combineModifiers(this.modifiers, dayPickerProps.modifiers),
            modifiersClassNames: {
                ...this.modifiersClassNames,
                ...dayPickerProps.modifiersClassNames,
            },
        };
    }

    /**
     * Custom formatter to render weekday names in the calendar header. The default formatter generally works fine,
     * but it was returning CAPITALIZED strings for some reason, while we prefer Title Case.
     */
    private formatWeekdayName: DateFormatter = date => format(date, "EEEEEE", { locale: this.state.locale });

    private handleDayMouseEnter: DayMouseEventHandler = (day, activeModifiers, e) => {
        this.props.dayPickerProps?.onDayMouseEnter?.(day, activeModifiers, e);
        if (activeModifiers.disabled) {
            return;
        }
        const { dateRange, boundary } = DateRangeSelectionStrategy.getNextState(
            this.state.value,
            day,
            this.props.allowSingleDayRange!,
            this.props.boundaryToModify,
        );
        this.setState({ hoverValue: dateRange });
        this.props.onHoverChange?.(dateRange, day, boundary);
    };

    private handleDayMouseLeave: DayMouseEventHandler = (day, activeModifiers, e) => {
        this.props.dayPickerProps?.onDayMouseLeave?.(day, activeModifiers, e);
        if (activeModifiers.disabled) {
            return;
        }
        this.setState({ hoverValue: undefined });
        this.props.onHoverChange?.(undefined, day, undefined);
    };

    private handleDayRangeSelect = (nextValue: DateRange, selectedDay: Date, boundary: Boundary) => {
        // update the hovered date range after click to show the newly selected
        // state, at leasts until the mouse moves again
        this.setState({ hoverValue: nextValue });
        this.props.onHoverChange?.(nextValue, selectedDay, boundary);
        this.updateSelectedRange(nextValue);
    };

    private handleShortcutClick = (shortcut: DateRangeShortcut, selectedShortcutIndex: number) => {
        const { dateRange, includeTime } = shortcut;

        if (includeTime) {
            this.updateSelectedRange(dateRange, [dateRange[0], dateRange[1]]);
        } else {
            this.updateSelectedRange(dateRange);
        }

        if (this.props.selectedShortcutIndex === undefined) {
            // uncontrolled shorcut selection
            this.setState({ selectedShortcutIndex });
        }

        this.props.onShortcutChange?.(shortcut, selectedShortcutIndex);
    };

    private updateSelectedRange = (selectedRange: DateRange, selectedTimeRange: DateRange = this.state.time) => {
        selectedRange[0] = DateUtils.getDateTime(selectedRange[0], selectedTimeRange[0]);
        selectedRange[1] = DateUtils.getDateTime(selectedRange[1], selectedTimeRange[1]);

        if (this.props.value == null) {
            // uncontrolled range selection
            this.setState({ time: selectedTimeRange, value: selectedRange });
        }
        this.props.onChange?.(selectedRange);
    };
}

function getIsSingleMonthOnly(props: DateRangePickerProps): boolean {
    return props.singleMonthOnly || DateUtils.isSameMonth(props.minDate!, props.maxDate!);
}

function getInitialValue(props: DateRangePickerProps): DateRange {
    if (props.value != null) {
        return props.value;
    }
    if (props.defaultValue != null) {
        return props.defaultValue;
    }
    return NULL_RANGE;
}

function getInitialMonth(props: DateRangePickerProps, value: DateRange): Date {
    const today = new Date();
    const isSingleMonthOnly = getIsSingleMonthOnly(props);

    if (props.initialMonth != null) {
        if (!isSingleMonthOnly && DateUtils.isSameMonth(props.initialMonth, props.maxDate!)) {
            // special case: if initial month is same as maxDate month, display it on the right calendar
            return DateUtils.getDatePreviousMonth(props.initialMonth);
        }
        return props.initialMonth;
    } else if (value[0] != null) {
        if (!isSingleMonthOnly && DateUtils.isSameMonth(value[0], props.maxDate!)) {
            // special case: if start of range is selected and that date is in the maxDate month, display it on the right calendar
            return DateUtils.getDatePreviousMonth(value[0]);
        }
        return DateUtils.clone(value[0]);
    } else if (value[1] != null) {
        const month = DateUtils.clone(value[1]);
        if (!DateUtils.isSameMonth(month, props.minDate!)) {
            month.setMonth(month.getMonth() - 1);
        }
        return month;
    } else if (DateUtils.isDayInRange(today, [props.minDate!, props.maxDate!])) {
        if (!isSingleMonthOnly && DateUtils.isSameMonth(today, props.maxDate!)) {
            // special case: if today is in the maxDate month, display it on the right calendar
            today.setMonth(today.getMonth() - 1);
        }
        return today;
    } else {
        const betweenDate = DateUtils.getDateBetween([props.minDate!, props.maxDate!]);
        if (!isSingleMonthOnly && DateUtils.isSameMonth(betweenDate, props.maxDate!)) {
            // special case: if betweenDate is in the maxDate month, display it on the right calendar
            betweenDate.setMonth(betweenDate.getMonth() - 1);
        }
        return betweenDate;
    }
}
