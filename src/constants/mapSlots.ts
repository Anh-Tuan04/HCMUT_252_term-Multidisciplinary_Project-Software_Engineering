import type { ParkingSlotView } from "../types/parking";

export const DEFAULT_SLOTS: ParkingSlotView[] = [
  { id: 1, name: "A1", orientation: "down", status: "empty" },
  { id: 2, name: "A2", orientation: "down", status: "empty" },
  { id: 3, name: "A3", orientation: "down", status: "empty" },
  { id: 4, name: "A4", orientation: "down", status: "empty" },
  { id: 5, name: "A5", orientation: "up", status: "empty" },
  { id: 6, name: "A6", orientation: "up", status: "empty" },
  { id: 7, name: "A7", orientation: "up", status: "empty" },
  { id: 8, name: "A8", orientation: "up", status: "empty" },
];
