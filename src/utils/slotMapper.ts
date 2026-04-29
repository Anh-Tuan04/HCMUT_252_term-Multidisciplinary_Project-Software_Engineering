import type {
  ParkingSlotView,
  ServerSlotStatus,
  SlotStats,
  SlotStatusUpdatedPayload,
  SlotVisualStatus,
} from "../types/parking";

interface SnapshotSlot {
  id?: number;
  name?: string;
  status?: string;
}

export const toVisualStatus = (value: string | undefined): SlotVisualStatus => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "OCCUPIED") {
    return "occupied";
  }

  if (normalized === "MAINTAIN" || normalized === "WARNING") {
    return "warning";
  }

  return "empty";
};

export const toServerStatus = (value: SlotVisualStatus): ServerSlotStatus => {
  if (value === "occupied") {
    return "OCCUPIED";
  }

  if (value === "warning") {
    return "MAINTAIN";
  }

  return "AVAILABLE";
};

export const calculateSlotStats = (slots: ParkingSlotView[]): SlotStats => {
  const total = slots.length;
  const warning = slots.filter((slot) => slot.status === "warning").length;
  const occupied = slots.filter((slot) => slot.status === "occupied").length;
  const empty = slots.filter((slot) => slot.status === "empty").length;
  const usable = Math.max(total - warning, 0);

  return {
    empty,
    occupied,
    warning,
    total,
    usable,
  };
};

export const applyRealtimeSlotUpdate = (
  previous: ParkingSlotView[],
  payload: SlotStatusUpdatedPayload,
  expectedLotId: number,
): ParkingSlotView[] => {
  if (typeof payload.lot_id === "number" && payload.lot_id !== expectedLotId) {
    return previous;
  }

  const index = previous.findIndex(
    (slot) =>
      (typeof payload.id === "number" && payload.id === slot.id) ||
      (typeof payload.name === "string" && payload.name.toUpperCase() === slot.name.toUpperCase()),
  );

  if (index < 0) {
    return previous;
  }

  const nextStatus = toVisualStatus(payload.new_status);

  if (nextStatus === previous[index].status) {
    return previous;
  }

  const next = [...previous];
  next[index] = {
    ...next[index],
    status: nextStatus,
  };

  return next;
};

export const applySnapshot = (previous: ParkingSlotView[], snapshot: SnapshotSlot[]): ParkingSlotView[] => {
  if (!snapshot.length) {
    return previous;
  }

  const byId = new Map<number, SnapshotSlot>();
  const byName = new Map<string, SnapshotSlot>();

  snapshot.forEach((item) => {
    if (typeof item.id === "number") {
      byId.set(item.id, item);
    }

    if (typeof item.name === "string") {
      byName.set(item.name.toUpperCase(), item);
    }
  });

  return previous.map((slot) => {
    const source = byId.get(slot.id) ?? byName.get(slot.name.toUpperCase());
    if (!source) {
      return slot;
    }

    return {
      ...slot,
      status: toVisualStatus(source.status),
    };
  });
};
