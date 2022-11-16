import React, { useEffect, useMemo, useRef, useState } from "react";
import "./default.css";

import {
  startOfWeek,
  addDays,
  format,
  addHours,
  startOfDay,
  isAfter,
  differenceInCalendarDays,
  endOfDay,
  areIntervalsOverlapping,
  isBefore,
} from "date-fns";
import { addMinutes } from "date-fns/esm";

export interface Event {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
}

export interface TimelineCalendarProps {
  currentDate: Date;
  events: Event[];
  numberOfColumns?: number;
  twentyFourHourClock?: boolean;
  onCellClick?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
  disableCellPredicate?: (date: Date) => boolean;
  hourWindowDateFormat?: string;
  dateWindowDateFormat?: string;
  businessHourStart?: number;
}

interface EventProps {
  event: Event;
  positionData: PositionData;
  timelineData: { start: Date; end: Date };
  onClick: () => void;
}

type EventViewData = PositionData & Event & { viewStart: Date; viewEnd: Date };

function TimelineCalendar({
  numberOfColumns,
  currentDate,
  events,
  onCellClick,
  onEventClick,
  disableCellPredicate = (date: Date) => false,
  dateWindowDateFormat = "dd.MM.yy",
  hourWindowDateFormat = "h aa",
  businessHourStart = 8,
}: TimelineCalendarProps) {
  let startOfWeekDate = startOfWeek(currentDate);
  let gridRef = useRef<null | HTMLDivElement>(null);

  let dataToRender = useMemo(
    () =>
      events
        .map((e: Event) => createViewsByEvent(e, 1525)) // last argument is grid height.
        .flatMap((views: EventViewData[]) =>
          views.map<EventViewData & { component: React.FC<EventProps> }>(
            (v) => ({
              ...v,
              component: StandardCell,
            })
          )
        ),
    [events]
  );

  useEffect(() => {
    let scrollYValue = (1525 / 24) * businessHourStart;
    if (gridRef.current) {
      (gridRef.current as any).scroll(0, scrollYValue);
    }
  }, []);

  return (
    <div className="timeline-calendar">
      <div className="calendar-header">
        <div className="calendar-time">
          <div className="hour-cell"></div>
        </div>
        <div className="dates">
          {new Array(numberOfColumns ?? 7).fill(0).map((_, i) => (
            <div className="cell">
              {format(
                addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i),
                dateWindowDateFormat
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-grid" ref={gridRef}>
        <div className="calendar-time">
          {new Array(24).fill(0).map((_, i) => (
            <div className="hour-cell">
              {format(addHours(startOfWeekDate, i), hourWindowDateFormat)}
            </div>
          ))}
        </div>
        {new Array(numberOfColumns ?? 7)
          .fill(0)
          .map((_, i) => [
            startOfDay(
              addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
            ),
            endOfDay(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)),
          ])
          .map(([dateStart, dateEnd], i) => (
            <div className="timeline">
              {new Array(48)
                .fill(0)
                .map((_, i) => addMinutes(dateStart, i * 30))
                .map((date: Date, i: number) => (
                  <div
                    onClick={() =>
                      onCellClick && !disableCellPredicate(date)
                        ? onCellClick(date)
                        : null
                    }
                    className={`cell ${
                      disableCellPredicate(date) ? "disabled-cell" : null
                    }`}
                  ></div>
                ))}
              {dataToRender
                .filter((e: any) =>
                  areIntervalsOverlapping(
                    {
                      start: dateStart,
                      end: dateEnd,
                    },
                    {
                      start: e.viewStart,
                      end: e.viewEnd,
                    }
                  )
                )
                .map(
                  ({
                    component: Component,
                    start,
                    end,
                    title,
                    id,
                    pxElementHeight,
                    pxPositionStart,
                  }: EventViewData & { component: React.FC<EventProps> }) => (
                    <Component
                      onClick={() =>
                        onEventClick
                          ? onEventClick({
                              id,
                              title: title,
                              start: start,
                              end: end,
                            })
                          : null
                      }
                      event={{ start, end, title, id }}
                      positionData={{ pxElementHeight, pxPositionStart }}
                      timelineData={{ start: dateStart, end: dateEnd }}
                    />
                  )
                )}
            </div>
          ))}
      </div>
    </div>
  );
}

interface PositionData {
  pxPositionStart: number;
  pxElementHeight: number;
}

function calcPositionData(
  gridHeight: number,
  startDate: Date,
  endDate: Date
): PositionData {
  // minutes since start of day.
  let minutes =
    (startDate.getTime() - startOfDay(startDate).getTime()) / 1000 / 60;

  // pixels per minute (by grid height).
  let ppm = gridHeight / 1440;

  let diffMinutesStartEnd =
    (endDate.getTime() - startDate.getTime()) / 1000 / 60;

  let pxElementHeight = diffMinutesStartEnd * ppm;

  let pxPositionStart = ppm * minutes;

  return {
    pxPositionStart,
    pxElementHeight,
  };
}

function StandardCell({
  positionData,
  event,
  timelineData,
  onClick,
}: EventProps) {
  return (
    <div
      className="event"
      onClick={onClick}
      style={{
        position: "absolute",
        top: `${positionData.pxPositionStart}px`,
        height: `${positionData.pxElementHeight}px`,
        borderTopRightRadius: isAfter(event.start, timelineData.start)
          ? "10px"
          : "0px",
        borderTopLeftRadius: isAfter(event.start, timelineData.start)
          ? "10px"
          : "0px",
        borderBottomRightRadius: isBefore(event.end, timelineData.end)
          ? "10px"
          : "0px",
        borderBottomLeftRadius: isBefore(event.end, timelineData.end)
          ? "10px"
          : "0px",
      }}
    >
      {event.title}
    </div>
  );
}

function createViewsByEvent(event: Event, gridHeight: number): EventViewData[] {
  let eventViews = [];
  let calendarDays = differenceInCalendarDays(event.end, event.start);

  if (calendarDays == 0) {
    eventViews.push({
      ...calcPositionData(gridHeight, event.start, event.end),
      viewStart: event.start,
      viewEnd: event.end,
      start: event.start,
      end: event.end,
      title: event.title,
      id: event.id,
    });

    return eventViews;
  }

  if (calendarDays == 1) {
    eventViews.push({
      ...calcPositionData(gridHeight, event.start, endOfDay(event.start)),
      viewStart: event.start,
      viewEnd: endOfDay(event.start),
      start: event.start,
      end: event.end,
      title: event.title,
      id: event.id,
    });

    eventViews.push({
      ...calcPositionData(gridHeight, startOfDay(event.end), event.end),
      viewStart: startOfDay(event.end),
      viewEnd: event.end,
      start: event.start,
      end: event.end,
      title: event.title,
      id: event.id,
    });

    return eventViews;
  }

  for (let i = 0; i <= calendarDays; i++) {
    if (i == 0) {
      eventViews.push({
        ...calcPositionData(gridHeight, event.start, endOfDay(event.start)),
        viewStart: event.start,
        viewEnd: endOfDay(event.start),
        start: event.start,
        end: event.end,
        title: event.title,
        id: event.id,
      });
      continue;
    }

    if (i == calendarDays) {
      eventViews.push({
        ...calcPositionData(gridHeight, startOfDay(event.end), event.end),
        viewStart: startOfDay(event.end),
        viewEnd: event.end,
        start: event.start,
        end: event.end,
        title: event.title,
        id: event.id,
      });
      continue;
    }

    eventViews.push({
      ...calcPositionData(
        gridHeight,
        startOfDay(addDays(event.start, i)),
        endOfDay(addDays(event.start, i))
      ),
      viewStart: startOfDay(addDays(event.start, i)),
      viewEnd: endOfDay(addDays(event.start, i)),
      start: event.start,
      end: event.end,
      title: event.title,
      id: event.id,
    });
  }

  return eventViews;
}

/* function createEventView(
  event: Event,
  start: Date,
  end: Date,
  gridHeight: number
): EventViewData {
  return {
    ...calcPositionData(gridHeight, start, end),
    ...event,
    start,
    end,
  };
} */

export default TimelineCalendar;
