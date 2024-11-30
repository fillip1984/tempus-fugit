import { atom } from "jotai";

export const subTasksAtom = atom([
  { name: "Copywriting", progress: (3 / 9) * 100, checklist: "3/9" },
  { name: "Illustrations", progress: (6 / 9) * 100, checklist: "6/9" },
  { name: "UI Design", progress: (9 / 9) * 100, checklist: "9/9" },
]);
