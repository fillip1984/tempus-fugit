"use client";

import { useAtom } from "jotai";
import { plannerAtom } from "@/stores/plannerAtom";
import AgendaView from "../_components/AgendaView";
export default function Planner() {
  const [planner] = useAtom(plannerAtom);

  return (
    <section className="flex flex-1 flex-col overflow-hidden p-4 text-white">
      <div className="flex flex-1 gap-4 overflow-x-auto">
        {planner.map((day) => (
          <AgendaView key={day.name} day={day} />
        ))}
      </div>
    </section>
  );
}
