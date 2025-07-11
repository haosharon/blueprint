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

import type { DatePickerBaseProps } from "./datePickerBaseProps";
import { isDateValid, isDayInRange } from "./dateUtils";

export interface DateFormatProps {
    /**
     * The error message to display when the date selected is invalid.
     *
     * @default "Invalid date"
     */
    invalidDateMessage?: string;

    /**
     * The locale name, which is passed to `formatDate`, `parseDate`
     */
    locale?: string;

    /**
     * The error message to display when the date selected is out of range.
     *
     * @default "Out of range"
     */
    outOfRangeMessage?: string;

    /**
     * Placeholder text to display in empty input fields.
     * Recommended practice is to indicate the expected date format.
     */
    placeholder?: string;

    /**
     * Function to render a JavaScript `Date` to a string.
     * Optional `localeCode` argument comes directly from the prop on this component:
     * if the prop is defined, then the argument will be too.
     */
    formatDate(date: Date, localeCode?: string): string;

    /**
     * Function to deserialize user input text to a JavaScript `Date` object.
     * Return `false` if the string is an invalid date.
     * Return `null` to represent the absence of a date.
     * Optional `localeCode` argument comes directly from the prop on this component.
     */
    parseDate(str: string, localeCode?: string): Date | false | null;
}

export function getFormattedDateString(
    date: Date | false | null | undefined,
    props: Omit<DateFormatProps, "parseDate"> & Pick<DatePickerBaseProps, "maxDate" | "minDate">,
    ignoreRange = false,
) {
    if (date == null) {
        return "";
    } else if (!isDateValid(date)) {
        return props.invalidDateMessage;
    } else if (ignoreRange || isDayInRange(date, [props.minDate ?? null, props.maxDate ?? null])) {
        return props.formatDate(date, props.locale);
    } else {
        return props.outOfRangeMessage;
    }
}
