import { useMemo, useState } from "react";

import { DEFAULT_SLOTS } from "../constants/mapSlots";
import type { UserRole } from "../types/auth";
import { calculateSlotStats } from "../utils/slotMapper";
import { useParkingMapAdmin } from "./map-page/useParkingMapAdmin";
import { useParkingMapRealtime } from "./map-page/useParkingMapRealtime";

interface UseParkingMapOptions {
  accessToken?: string;
  role: UserRole | "GUEST";
  onError?: (message: string) => void;
}

export const useParkingMap = ({ accessToken, role, onError }: UseParkingMapOptions) => {
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const realtime = useParkingMapRealtime({ accessToken, setSlots, onError });
  const admin = useParkingMapAdmin({ accessToken, role, setSlots, onError });

  const stats = useMemo(() => calculateSlotStats(slots), [slots]);

  return {
    slots,
    stats,
    ...realtime,
    ...admin,
  };
};
