import { format, getHours, setHours } from "date-fns";
import { useEffect, useState, type PointerEvent } from "react";
import { type AgendaEvent, type Timeslot } from "@/types";

type EventCardState = {
  isDragging: boolean;
  originalY: number;
  translateY: number;
  lastTranslateY: number;

  isResizing: boolean;
  resizeFrom?: string;
  height: number;

  isModalOpen: boolean;
  isOver: boolean;
};

const CARD_GAP = -1;

export default function EventCard({
  event,
  handleEventUpdate,
  timeslots,
  calculateHourBasedOnPosition,
  calculatePositionBaseOnHour,
  calculateWidthAndElevationPosition,
}: {
  event: AgendaEvent;
  handleEventUpdate: (start: Date, end: Date, id: string) => void;
  timeslots: Timeslot[];
  calculateHourBasedOnPosition: (clientY: number) => number | undefined;
  calculatePositionBaseOnHour: (
    start: Date,
    end: Date,
  ) => { top: number; bottom: number };
  calculateWidthAndElevationPosition: () => void;
}) {
  const [state, setState] = useState<EventCardState>({
    // drag props
    isDragging: false,
    originalY: 0,
    translateY: 0,
    lastTranslateY: 0,

    // resize props
    isResizing: false,
    resizeFrom: undefined,
    height: 0,

    // other props
    isModalOpen: true,
    isOver: false,
  });

  useEffect(() => {
    positionEventCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeslots]);

  const positionEventCard = () => {
    if (timeslots) {
      // console.info({ event: "Positioning event", id: event.id });
      const { top, bottom } = calculatePositionBaseOnHour(
        event.start,
        event.end,
      );
      calculateWidthAndElevationPosition();
      //   console.dir({ top, bottom });
      if (top !== undefined && bottom != undefined) {
        setState((prev) => ({
          ...prev,
          isDragging: false,
          isResizing: false,
          translateY: top,
          lastTranslateY: top,

          height: bottom - top,
        }));
      }
    }
  };

  const handleDragStart = (e: PointerEvent<HTMLDivElement>) => {
    if (e.detail == 2) {
      handleDoubleClick();
      return;
    }

    // console.info({ event: "Drag start", id: event.id });
    setState((prev) => ({
      ...prev,
      isDragging: true,
      originalY: e.clientY,
    }));
  };

  const handleDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!state.isDragging) {
      return;
    }
    // console.debug({ event: "Dragging", id: event.id });

    const newY = e.clientY - state.originalY + state.lastTranslateY;

    const hour = calculateHourBasedOnPosition(newY);
    if (hour !== undefined && getHours(event.start) !== hour) {
      const change = getHours(event.start) - hour;
      handleEventUpdate(
        setHours(event.start, hour),
        setHours(event.end, getHours(event.end) - change),
        event.id,
      );
    }

    setState((prev) => ({
      ...prev,
      translateY: newY,
    }));
  };

  const handleDragEnd = () => {
    if (!state.isDragging) {
      return;
    }
    // console.info({ event: "Drag end", id: event.id });
    setState((prev) => ({
      ...prev,
      isDragging: false,
    }));
    positionEventCard();
  };

  const handleResizeStart = (e: PointerEvent<HTMLDivElement>) => {
    // console.info({ event: "Resize start", id: event.id });
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const resizeFrom = e.currentTarget.dataset["resizefrom"];
    setState((prev) => ({
      ...prev,
      isResizing: true,
      resizeFrom,
    }));
  };

  const handleResize = (e: PointerEvent<HTMLDivElement>) => {
    if (!state.isResizing) {
      return;
    }

    // console.debug({ event: "Resizing", id: event.id });

    // this code, along with the style={{heigh:...}}, is what causes the card to resize
    // To properly calculate height of the element, and thus resize it, you have to know how far
    // from the top of the visible screen this element is. That's because e.clientY is the
    // absolute position of the cursor on the screen
    let resizeOrigin = 0;
    if (state.resizeFrom === "bottom") {
      resizeOrigin =
        e.currentTarget.parentElement?.getBoundingClientRect().top ?? 0;
    } else {
      resizeOrigin =
        e.currentTarget.parentElement?.getBoundingClientRect().bottom ?? 0;
    }
    setState((prev) => ({
      ...prev,
      //   // arbitruary + 15 just makes resizing look more natural.
      //   // The cursor gets ahead of the resize and padding by + 15
      //   // seems to hold the cursor closer to the handle
      //   // (might be the handle's pixel size maybe?)
      height: e.clientY - resizeOrigin + 15,
    }));

    // this code maintains the event.endDate
    const bottom =
      e.currentTarget.parentElement?.getBoundingClientRect().bottom ?? 0;
    const hour = calculateHourBasedOnPosition(bottom);
    if (hour !== undefined && getHours(event.end) !== hour + 1) {
      handleEventUpdate(event.start, setHours(event.end, hour + 1), event.id);
    }
  };

  const handleResizeEnd = (e: PointerEvent<HTMLDivElement>) => {
    // console.info({ event: "Resize end", id: event.id });
    e.currentTarget.releasePointerCapture(e.pointerId);
    setState((prev) => ({
      ...prev,
      isResizing: false,
    }));
    positionEventCard();
  };

  const handleDoubleClick = () => {
    setState((prev) => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  };

  const handleEnter = () => {
    setState((prev) => ({ ...prev, isOver: true }));
  };

  const handleLeave = () => {
    setState((prev) => ({ ...prev, isOver: false }));
  };

  return (
    <div
      className="absolute rounded border border-l-[6px] bg-green-300 bg-green-400/20 px-2 text-black"
      style={{
        transform: `translateY(${state.translateY - CARD_GAP}px)`,
        cursor: `${state.isDragging ? "grabbing" : "grab"}`,
        height: `${state.height + CARD_GAP * 2}px`,
        zIndex: `${
          state.isDragging || state.isResizing ? "999" : event.zIndex
        }`,
        left: `${event.left}%`,
        right: `${event.right}%`,
        // left: `${state.isDragging || state.isResizing ? "0" : event.left}%`,
        // right: `${state.isDragging || state.isResizing ? "0" : event.right}%`,
      }}
      onPointerDown={handleDragStart}
      onPointerMove={handleDrag}
      onPointerUp={handleDragEnd}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      // onPointerCancel={handleDragEnd}
      // reason for onMouseOver and onMouseOut: https://stackoverflow.com/questions/47295211/safari-wrong-cursor-when-dragging
      onMouseOver={() => {
        document.onselectstart = () => {
          return false;
        };
      }}
      onMouseOut={() => {
        document.onselectstart = () => {
          return true;
        };
      }}>
      <div className="relative h-full w-full">
        <h3 className="-mb-2">{event.description}</h3>
        <span className="text-xs">
          {format(event.start, "h aa")} - {format(event.end, "h aa")} (
          {getHours(event.end) - getHours(event.start)} hrs)
        </span>
        {state.isModalOpen && <span>Modal Time!</span>}
        {state.isOver && (
          <>
            {/* TODO: get this working */}
            {/* <div
              data-resizefrom="top"
              onPointerDown={handleResizeStart}
              onPointerMove={handleResize}
              onPointerUp={handleResizeEnd}
              className="absolute -top-2 right-0 h-4 w-4 rounded-full border-2 border-black"
              style={{
                cursor: `${state.isResizing ? "grabbing" : "n-resize"}`,
              }}></div> */}
            <div
              data-resizefrom="bottom"
              onPointerDown={handleResizeStart}
              onPointerMove={handleResize}
              onPointerUp={handleResizeEnd}
              className="absolute -bottom-2 left-0 h-4 w-4 rounded-full border-2 border-black"
              style={{
                cursor: `${state.isResizing ? "grabbing" : "s-resize"}`,
              }}></div>
          </>
        )}
      </div>
    </div>
  );
}
