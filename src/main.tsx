import { addHours } from "date-fns/esm";
import React from "react";
import { createRoot } from "react-dom/client";
import TimelineCalendar from "./TimelineCalendar";

let el = document.getElementById("app");

let events = [
    {
        id: 1,
        title: "Test",
        start: new Date(),
        end: addHours(new Date(), 2)
    }
]

createRoot(el as HTMLElement).render(
    <>
        <TimelineCalendar events={events} currentDate={new Date()} />
    </>
);