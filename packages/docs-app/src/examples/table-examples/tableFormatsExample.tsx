/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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

import { Example, type ExampleProps } from "@blueprintjs/docs-theme";
import { Cell, Column, JSONFormat, Table, TruncatedFormat } from "@blueprintjs/table";

interface Timezone {
    name: string;
    offsetMsec: number;
    offsetString: string;
}

const LOCAL_TIMEZONE_OFFSET_MSEC = new Date().getTimezoneOffset() * 60 * 1000;

// TODO(adahiya): import timezones from datetime package
const TIME_ZONES: Timezone[] = (
    [
        ["-12:00", -12.0, "Etc/GMT+12"],
        ["-11:00", -11.0, "Pacific/Midway"],
        ["-10:00", -10.0, "Pacific/Honolulu"],
        ["-09:30", -9.5, "Pacific/Marquesas"],
        ["-09:00", -9.0, "America/Anchorage"],
        ["-08:00", -8.0, "America/Los_Angeles"],
        ["-07:00", -7.0, "America/Denver"],
        ["-06:00", -6.0, "America/Chicago"],
        ["-05:00", -5.0, "America/New_York"],
        ["-04:30", -4.5, "America/Caracas"],
        ["-04:00", -4.0, "America/Puerto_Rico"],
        ["-03:30", -3.5, "America/St_Johns"],
        ["-03:00", -3.0, "America/Buenos_Aires"],
        ["-02:00", -2.0, "America/Noronha"],
        ["-01:00", -1.0, "Atlantic/Azores"],
        ["+00:00", 0.0, "UTC"],
        ["+01:00", 1.0, "Europe/Berlin"],
        ["+02:00", 2.0, "Africa/Cairo"],
        ["+03:00", 3.0, "Asia/Baghdad"],
        ["+04:00", 4.0, "Asia/Dubai"],
        ["+04:30", 4.5, "Asia/Kabul"],
        ["+05:00", 5.0, "Asia/Karachi"],
        ["+05:30", 5.5, "Asia/Kolkata"],
        ["+05:45", 5.75, "Asia/Kathmandu"],
        ["+06:00", 6.0, "Asia/Dhaka"],
        ["+06:30", 6.5, "Asia/Rangoon"],
        ["+07:00", 7.0, "Asia/Bangkok"],
        ["+08:00", 8.0, "Asia/Hong_Kong"],
        ["+08:45", 8.0, "Australia/Eucla"],
        ["+09:00", 9.0, "Asia/Tokyo"],
        ["+09:30", 9.5, "Australia/Darwin"],
        ["+10:00", 10.0, "Australia/Sydney"],
        ["+10:30", 10.5, "Australia/Lord_Howe"],
        ["+11:00", 11.0, "Asia/Magadan"],
        ["+11:30", 11.5, "Pacific/Norfolk"],
        ["+12:00", 12.0, "Pacific/Auckland"],
        ["+12:45", 12.75, "Pacific/Chatham"],
        ["+13:00", 13.0, "Pacific/Tongatapu"],
        ["+14:00", 14.0, "Pacific/Kiritimati"],
    ] as Array<[string, number, string]>
).map(arr => {
    return {
        name: arr[2],
        offsetMsec: (arr[1] as number) * 60 * 60 * 1000 + LOCAL_TIMEZONE_OFFSET_MSEC,
        offsetString: arr[0],
    };
});

export class TableFormatsExample extends React.PureComponent<ExampleProps> {
    private data = TIME_ZONES;

    private date = new Date();

    public render() {
        return (
            <Example options={false} showOptionsBelowExample={true} {...this.props}>
                <Table enableRowResizing={true} numRows={this.data.length}>
                    <Column name="Timezone" cellRenderer={this.renderTimezone} />
                    <Column name="UTC Offset" cellRenderer={this.renderOffset} />
                    <Column name="Local Time" cellRenderer={this.renderLocalTime} />
                    <Column name="Timezone JSON" cellRenderer={this.renderJSON} />
                </Table>
            </Example>
        );
    }

    private renderTimezone = (row: number) => <Cell>{this.data[row].name}</Cell>;

    private renderOffset = (row: number) => <Cell>{this.data[row].offsetString}</Cell>;

    private renderLocalTime = (row: number) => {
        const localDateTime = new Date(this.date);
        localDateTime.setTime(localDateTime.getTime() + this.data[row].offsetMsec);
        const formattedDateTime = localDateTime.toLocaleString("en-US", {
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            month: "long",
            second: "2-digit",
            weekday: "long",
            year: "numeric",
        });
        return (
            <Cell>
                <TruncatedFormat detectTruncation={true}>{formattedDateTime}</TruncatedFormat>
            </Cell>
        );
    };

    private renderJSON = (row: number) => (
        <Cell>
            <JSONFormat detectTruncation={true}>{this.data[row]}</JSONFormat>
        </Cell>
    );
}
