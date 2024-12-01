"use client";

import Link from "next/link";
import { useState } from "react";
import { BsChevronDoubleRight } from "react-icons/bs";
import { FaCalendarDay, FaTimeline } from "react-icons/fa6";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className={`flex transform flex-col items-center bg-slate-400 transition-all ${isOpen ? "w-[200px]" : "w-[100px]"}`}>
      <span>SideNav</span>
      <ul className="mt-3 flex flex-col gap-2">
        <Link href={"/"}>
          <li className="flex items-center justify-center gap-2 rounded bg-slate-300 p-2">
            <FaTimeline />
            {isOpen && <span>Timeline</span>}
          </li>
        </Link>
        <Link href={"/planner"}>
          <li className="flex items-center justify-center gap-2 rounded bg-slate-300 p-2">
            <FaCalendarDay />
            {isOpen && <span>Daily</span>}
          </li>
        </Link>
        <li>Section C</li>
      </ul>
      <div className="mb-4 mt-auto">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-6xl">
          <BsChevronDoubleRight
            className={`text-4xl transition ${isOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>
    </nav>
  );
}
