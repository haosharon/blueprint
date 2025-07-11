---
reference: datetime
---

@# Datetime

The [**@blueprintjs/datetime** package](https://www.npmjs.com/package/@blueprintjs/datetime)
provides React components for interacting with dates and times:

-   [**DatePicker**](#datetime/datepicker) for selecting a single date (day, month, year).

-   [**DateRangePicker**](#datetime/daterangepicker) for selecting date ranges.

-   [**DateInput**](#datetime/date-input), which composes a text input with a DatePicker in
    a Popover, for use in forms.

-   [**DateRangeInput**](#datetime/date-range-input), which composes two text inputs with a
    DateRangePicker in a Popover, for use in forms.

-   [**TimePicker**](#datetime/timepicker) for selecting a time (hour, minute, second, millisecond).

Make sure to review the [getting started docs for installation info](#blueprint/getting-started).

```sh
npm install --save @blueprintjs/datetime
```

Import the package stylesheet in Sass:

```scss
@import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
```

...or in plain HTML:

```html
<link href="path/to/node_modules/@blueprintjs/datetime/lib/css/blueprint-datetime.css" rel="stylesheet" />
```

@page date-picker
@page date-input
@page date-range-picker
@page date-range-input
@page timepicker
@page timezone-select
