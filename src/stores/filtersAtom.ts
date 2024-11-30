import { atom } from "jotai";

export const filtersAtom = atom([
  { name: "All", count: 24, selected: false },
  { name: "Communication", count: 8, selected: true },
  { name: "Design", count: 4, selected: true },
  { name: "Productivity", count: 12, selected: false },
]);
