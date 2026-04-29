export type SlotOrientation = "down" | "up";

export type SlotVisualStatus = "empty" | "occupied" | "warning";

export type ServerSlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTAIN";

export interface ParkingSlotView {
  id: number;
  name: string;
  orientation: SlotOrientation;
  status: SlotVisualStatus;
  isUpdating?: boolean;
}

export interface SlotStats {
  empty: number;
  occupied: number;
  warning: number;
  total: number;
  usable: number;
}

export interface SlotStatusUpdatedPayload {
  id?: number;
  lot_id?: number;
  name?: string;
  old_status?: string;
  new_status?: string;
  changed?: boolean;
  message?: string;
}

export interface ParkingRealtimeEnvelope {
  event?: string;
  data?: unknown;
}
