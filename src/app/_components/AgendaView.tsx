import {
  eachHourOfInterval,
  endOfDay,
  format,
  getHours,
  setHours,
  startOfDay,
} from "date-fns";
import { useEffect, useRef, useState } from "react";

import { Day, type AgendaEvent, type Timeslot } from "@/types";
import EventCard from "./EventCard";

export default function AgendaView({ day }: { day: Day }) {
  // doesn't round properly but gets you pretty close. Doesn't round down if .4
  const roundToNearestHundreth = (number: number) => {
    return Math.ceil(number * 100) / 100;
  };

  // may want to use screen size to change this from 1 to 2 depending on the media queries
  // .5 looks good on full screen laptops
  // 1 looks good tablets
  // 2 looks good on mobile screens
  const ELEVATION_MULTIPLIER = 2;

  const hours = eachHourOfInterval({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  // hours render the slots on the screen, timeslots track pixel specific locations
  // for drag and resize and laying out of events
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  useEffect(() => {
    handleTimeslots();
  }, []);

  const handleTimeslots = () => {
    const calculatedTimeslots: Timeslot[] = [];
    const timeslotDivs = document.querySelectorAll("[data-timeslot") as unknown;

    (timeslotDivs as HTMLDivElement[]).forEach((timeslotDiv) => {
      if (!timeslotDiv.dataset.timeslot) {
        throw new Error(
          "Missing timeslot data, data attribute does not contain a value",
        );
      }
      const hour = parseInt(timeslotDiv.dataset.timeslot);
      calculatedTimeslots.push({
        hour,
        date: setHours(startOfDay(new Date()), hour),
        top: timeslotDiv.getBoundingClientRect().top,
        bottom:
          timeslotDiv.getBoundingClientRect().top +
          timeslotDiv.getBoundingClientRect().height,
      });
    });

    setTimeslots(calculatedTimeslots);
  };

  const [events, setEvents] = useState<AgendaEvent[]>([
    {
      id: "1",
      start: setHours(startOfDay(new Date()), 2),
      end: setHours(startOfDay(new Date()), 8),
      description: "First",
      left: 0,
      right: 0,
      zIndex: 0,
    },
    {
      id: "2",
      start: setHours(startOfDay(new Date()), 1),
      end: setHours(startOfDay(new Date()), 4),
      description: "Second",
      left: 0,
      right: 0,
      zIndex: 0,
    },
    {
      id: "3",
      start: setHours(startOfDay(new Date()), 2),
      end: setHours(startOfDay(new Date()), 5),
      description: "Third",
      left: 0,
      right: 0,
      zIndex: 0,
    },
    {
      id: "4",
      start: setHours(startOfDay(new Date()), 6),
      end: setHours(startOfDay(new Date()), 10),
      description: "Fourth",
      left: 0,
      right: 0,
      zIndex: 0,
    },
    {
      id: "5",
      start: setHours(startOfDay(new Date()), 9),
      end: setHours(startOfDay(new Date()), 10),
      description: "Fifth",
      left: 0,
      right: 0,
      zIndex: 0,
    },
  ]);

  const calculateHourBasedOnPosition = (clientY: number) => {
    const clientYOffset = clientY - agendaTopOffset;
    const timeslot = timeslots?.find(
      (timeslot) =>
        timeslot.top <= clientYOffset && timeslot.bottom >= clientYOffset,
    );

    return timeslot?.hour;
  };

  const calculatePositionBaseOnHour = (start: Date, end: Date) => {
    const firstTimeslot = timeslots.find(
      (timeslot) => timeslot.hour === getHours(start),
    );
    const secondTimeslot = timeslots.find(
      (timeslot) => timeslot.hour === getHours(end),
    );

    // timeslots not found, default to the top of the agenda
    if (!firstTimeslot || !secondTimeslot) {
      return { top: agendaTopOffset, bottom: agendaTopOffset };
    }

    return {
      top: firstTimeslot.top - agendaTopOffset,
      bottom: secondTimeslot.top - agendaTopOffset,
    };
  };

  const calculateWidthAndElevationPosition = () => {
    // console.log("calc width and elevation position run");
    const updates: {
      id: string;
      left: number;
      right: number;
      zIndex: number;
    }[] = [];
    let elevation = 0;
    let ongoingEvents = 0;
    timeslots.forEach((ts) => {
      const eventsStarting = events.filter(
        (e) => getHours(e.start) === ts.hour,
      );

      if (eventsStarting.length === 1 && eventsStarting[0]) {
        const id = eventsStarting[0].id;
        updates.push({ id, left: elevation, right: 0, zIndex: ts.hour });
      } else if (eventsStarting.length > 1) {
        let left = elevation;
        const width =
          roundToNearestHundreth(100 / eventsStarting.length) - elevation;
        let right = roundToNearestHundreth(100 - left - width);

        eventsStarting.forEach((e) => {
          updates.push({ id: e.id, left, right, zIndex: ts.hour });
          left += width + elevation;
          right = roundToNearestHundreth(100 - left - width);
        });
      }

      // have to subtract 1 hr since end goes onto instead of up to next hour.
      // For example, an event that is scheduled to run from 1 - 4 really goes
      // from 1:00 until 3:59 but not 4:00 on the dot
      const eventsEnding = events.filter(
        (e) => getHours(e.end) - 1 === ts.hour,
      ).length;
      ongoingEvents += eventsStarting.length - eventsEnding;
      if (ongoingEvents === 0) {
        elevation = 0;
      }
      // console.log({
      //   hour: ts.hour,
      //   eventsStarting: eventsStarting.length,
      //   eventsEnding,
      //   ongoingEvents,
      //   elevation,
      // });

      elevation += eventsStarting.length > 0 ? ELEVATION_MULTIPLIER : 0;
    });

    setEvents((prevState) => {
      return prevState.map((prevE) => {
        const update = updates.find((u) => u.id === prevE.id);
        if (update) {
          return {
            ...prevE,
            left: update.left,
            right: update.right,
            zIndex: update.zIndex,
          };
        } else {
          return prevE;
        }
      });
    });
  };

  const handleEventUpdate = (start: Date, end: Date, eventId: string) => {
    setEvents((prev) => {
      return prev.map((prevEvent) =>
        prevEvent.id === eventId
          ? {
              ...prevEvent,
              start,
              end,
            }
          : prevEvent,
      );
    });
  };

  // when calculating hour or top/bottom of timeslots you have to take into account the top position
  // of the agenda. This is because drag and resize send Y coordinate of cursor on the screen which
  // then has to be offset by the agenda's top position to be accurate
  const agendaRef = useRef<HTMLDivElement | null>(null);
  const [agendaTopOffset, setAgendaTopOffset] = useState(0);
  useEffect(() => {
    if (agendaRef) {
      // TODO: discovered that this isn't working, returns 0
      // console.log(agendaRef.current?.clientTop);
      const agendaTop = agendaRef.current?.getBoundingClientRect().top ?? 0;
      setAgendaTopOffset(agendaTop);
    }
  }, [agendaRef]);

  return (
    <div className="flex min-w-[300px] flex-col rounded border border-white p-2">
      <h2>{day.name}</h2>
      <div ref={agendaRef} className="mx-2 flex flex-1">
        {/* Draw agenda slot headers (shows the time for each slow, displayed on the left or head of slot) */}
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div
              key={hour.toISOString()}
              data-timeslot={format(hour, "H")}
              className="flex">
              <div className="border-grey/30 flex h-20 w-16 flex-col items-end border-t pr-1">
                <span className="-mb-1">{format(hour, "HH:mm")}</span>
                {/* <span className="text-sm text-gray-400">:15</span>
                <span className="text-sm text-gray-400">:30</span>
                <span className="text-sm text-gray-400">:45</span> */}
              </div>
            </div>
          ))}
        </div>

        {/* Draw agenda slots */}
        <div className="relative flex flex-1 flex-col">
          {hours.map((hour) => (
            <div key={hour.toISOString()} className="flex">
              <div className="border-grey/30 flex h-20 flex-1 items-center justify-center border-t"></div>
            </div>
          ))}

          {/* Draw events */}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              handleEventUpdate={handleEventUpdate}
              timeslots={timeslots}
              calculateHourBasedOnPosition={calculateHourBasedOnPosition}
              calculatePositionBaseOnHour={calculatePositionBaseOnHour}
              calculateWidthAndElevationPosition={
                calculateWidthAndElevationPosition
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
