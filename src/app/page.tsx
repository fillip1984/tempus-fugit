"use client";

import { useAtom } from "jotai";
import { BsChevronUp, BsThreeDots } from "react-icons/bs";
import { FaCircleCheck, FaRegCircle } from "react-icons/fa6";
import { filtersAtom } from "@/stores/filtersAtom";
import { subTasksAtom } from "@/stores/subTasksAtom";
import { type Filter } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // void api.post.getLatest.prefetch();

  const [subTasks] = useAtom(subTasksAtom);
  const [filters, setFilters] = useAtom(filtersAtom);

  const [collapsed, setCollapsed] = useState(false);

  const toggleFilter = (filter: Filter) => {
    let newFiltersState = filters;
    if (filter.name === "All") {
      // toggle all
      const currentAllState = newFiltersState.find(
        (f) => f.name === "All",
      )?.selected;
      newFiltersState = newFiltersState.map((f) => {
        return { ...f, selected: !currentAllState };
      });
    } else {
      // toggle specific filter option
      newFiltersState = newFiltersState.map((f) =>
        f.name === filter.name ? { ...f, selected: !f.selected } : f,
      );
      // maintain All filter state
      const allSelected =
        newFiltersState
          .filter((f) => f.name !== "All")
          .filter((f) => f.selected === true).length ===
        filters.length - 1;

      if (allSelected) {
        newFiltersState = newFiltersState.map((f) =>
          f.name === "All" ? { ...f, selected: true } : f,
        );
      } else {
        newFiltersState = newFiltersState.map((f) =>
          f.name === "All" ? { ...f, selected: false } : f,
        );
      }
    }

    setFilters(newFiltersState);
  };

  return (
    // <HydrateClient>
    <section className="flex flex-1 flex-col overflow-y-auto p-4 pb-48 text-white">
      <div className="flex h-[400px] min-w-[320px] flex-col rounded-xl bg-slate-200 p-4 text-black">
        <input
          type="search"
          placeholder="Search..."
          className="rounded bg-gray-400 p-2 text-black placeholder-white"
        />
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="my-3 flex items-center justify-between">
          <h5 className="font-semibold">Categories</h5>
          <BsChevronUp
            className={`transition ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
        <hr className="h-[3px] rounded-full bg-gray-300" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="overflow-hidden">
              <div className="my-2 flex w-full flex-col gap-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className="flex w-full items-center gap-2">
                      {filter.selected ? <FaCircleCheck /> : <FaRegCircle />}
                      <p
                        className={`${filter.selected ? "font-semibold" : "text-gray-400"}`}>
                        {filter.name}
                      </p>
                      <p
                        className={`ml-auto ${filter.selected ? "font-semibold" : "text-gray-400"}`}>
                        ({filter.count})
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="min-w-[400px] rounded-xl bg-slate-200 p-8 text-black">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold">Tasks Progress</h5>
          <BsThreeDots className="text-gray-600" />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {subTasks.map((subTask, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-sm">{subTask.name}</span>
                <span className="text-sm">{subTask.checklist}</span>
              </div>
              <div className="relative">
                <div className="h-2 w-full rounded-2xl bg-gray-400"></div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subTask.progress}%` }}
                  transition={{ type: "spring", bounce: 0.25 }}
                  className="absolute top-0 h-2 rounded-2xl bg-indigo-700"></motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel recusandae,
        qui exercitationem voluptatum cupiditate sunt necessitatibus a, nostrum
        quia explicabo magni vitae voluptatibus voluptas soluta eum quae! Ut
        sunt at alias unde tempora commodi repellendus aut voluptas aperiam,
        rerum hic, molestiae vero necessitatibus, accusamus optio dolor nobis
        nostrum tempore? Modi suscipit repellendus deserunt illo incidunt
        similique accusamus ad eos dolorum dolore vel repellat earum, laudantium
        id architecto, excepturi necessitatibus voluptate obcaecati
        exercitationem molestiae at consectetur mollitia? Harum pariatur
        consequuntur aliquam distinctio corporis iste reprehenderit. Deserunt
        sint, doloribus exercitationem distinctio nihil laboriosam consequatur
        commodi repellat odit perferendis dignissimos sapiente aliquid qui.
        Labore magni natus perferendis officia similique sequi adipisci
        necessitatibus mollitia fugit, repellendus reiciendis ab odio eius illum
        porro vero hic. Rem omnis dolores nostrum officiis, minus atque cum
        fugiat eum tenetur neque, vitae, sed assumenda voluptas in nesciunt esse
        tempora.
      </div>
    </section>
    // </HydrateClient>
  );
}
