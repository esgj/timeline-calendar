# Timeline Calendar for React.

Simple timeline calendar for React that is easy to customize and work with.

```js
import React from "react";
import TimelineCalendar, { TimelineCalendarProps } from "timeline-calendar";

let events = [
    {
        id: 1,
        title: "Workshop",
        start: new Date("2022-11-12 08:00"),
        end: new Date("2022-11-12 13:30"),
    }
];

let options: TimelineCalendarProps {
    events: events,
    // currentDate: Date;
    // events: Event[];
    // numberOfColumns?: number; Defaults to 7 (weekly).
    // onCellClick?: (date: Date) => void;
    // onEventClick?: (event: Event) => void;
    // disableCellPredicate?: (date: Date) => boolean; Defaults to false.
    // hourWindowDateFormat?: string; Format of the string is based on Unicode Technical Standard #35
    // dateWindowDateFormat?: string; Format of the string is based on Unicode Technical Standard #35
    // businessHourStart?: number; Defaults to 8.
}

default export function App() {
    let [dateNow, setDateNow] = useState(new Date());

    return <TimelineCalendar currentDate={dateNow} {...options} />;
}
```

![Screenshot 2022-11-16 at 10 37 07](https://user-images.githubusercontent.com/6502063/202144497-721d0b7a-f32d-4930-b08d-552973d88c0b.png)


It is easy to customize the theme by defining CSS variables as :root.

```css
:root {
    --cell-divider-color: #dce5ec;
    --cell-bg-color: white;
    --xy-bg-color: #eef6fd;
    --xy-color: #606060;
    --xy-divider-color: #b1bbc4;
    --border-color: transparent;
    --event-color: rgba(225, 81, 83, 0.75);
    --cell-hover-color: #a8a8a8;
    --cell-disabled-color: rgb(245, 245, 245);
}
```

Change height by assigning height to this CSS class:

```css
.timeline-calendar {
    height: 800px !important;
}

.calendar-grid {
    height: 600px !important;
}
```

This package exports ESM only at this point in time.