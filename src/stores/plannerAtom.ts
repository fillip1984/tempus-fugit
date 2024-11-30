import { atom } from "jotai";
import { type Day } from "@/types";

export const plannerAtom = atom<Day[]>([
  { name: "Sunday" },
  { name: "Monday" },
  // { name: "Tuesday" },
  // { name: "Wednesday" },
  // { name: "Thursday" },
  // { name: "Friday" },
  // { name: "Saturday" },
]);
