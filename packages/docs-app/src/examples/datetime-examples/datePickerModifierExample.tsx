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

import * as React from "react";

import { DatePicker } from "@blueprintjs/datetime";
import { Example, type ExampleProps } from "@blueprintjs/docs-theme";

export function DatePickerModifierExample(props: ExampleProps) {
    const isDayNumberOdd = React.useCallback((d: Date) => d.getDate() % 2 === 1, []);

    return (
        <Example options={false} {...props}>
            <DatePicker
                dayPickerProps={{
                    modifiers: {
                        odd: isDayNumberOdd,
                    },
                    modifiersClassNames: {
                        // styles defined in docs-app/src/styles/_examples.scss
                        odd: "docs-date-picker-day-odd",
                    },
                }}
            />
        </Example>
    );
}
