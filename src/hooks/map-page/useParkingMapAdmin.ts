import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { API_BASE_URL } from "../../constants/apiConfig";
import { FetchApiClient } from "../../servies/http/fetchApiClient";
import { RestParkingSlotAdminGateway } from "../../servies/parking-slot/restParkingSlotAdminGateway";
import type { UserRole } from "../../types/auth";
import type { ParkingSlotView, SlotVisualStatus } from "../../types/parking";
import { toServerStatus } from "../../utils/slotMapper";

const canManageSlotStatus = (role: UserRole | "GUEST"): boolean => {
  return role === "ADMIN" || role === "MANAGER";
};

interface UseParkingMapAdminOptions {
  accessToken?: string;
  role: UserRole | "GUEST";
  setSlots: Dispatch<SetStateAction<ParkingSlotView[]>>;
  onError?: (message: string) => void;
}

export const useParkingMapAdmin = ({ accessToken, role, setSlots, onError }: UseParkingMapAdminOptions) => {
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [adminActionError, setAdminActionError] = useState("");

  const adminGatewayRef = useRef(new RestParkingSlotAdminGateway(new FetchApiClient(API_BASE_URL)));

  const adminEnabled = useMemo(() => canManageSlotStatus(role), [role]);

  const openSlotMenu = useCallback(
    (slotId: number) => {
      if (!adminEnabled) {
        return;
      }

      setSelectedSlotId((previous) => (previous === slotId ? null : slotId));
      setAdminActionError("");
    },
    [adminEnabled],
  );

  const closeSlotMenu = useCallback(() => {
    setSelectedSlotId(null);
  }, []);

  const updateSlotStatusAsAdmin = useCallback(
    async (slotId: number, status: SlotVisualStatus) => {
      if (!adminEnabled) {
        return;
      }

      if (!accessToken) {
        const message = "Cần đăng nhập để cập nhật trạng thái";
        onError?.(message);
        setAdminActionError(message);
        return;
      }

      setAdminActionError("");

      setSlots((previous) =>
        previous.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                isUpdating: true,
              }
            : slot,
        ),
      );

      const result = await adminGatewayRef.current.updateSlotStatus(
        slotId,
        toServerStatus(status),
        accessToken,
      );

      if (!result.success || !result.data) {
        const message = result.message || "Không thể cập nhật trạng thái slot";
        onError?.(message);
        setAdminActionError(message);
        setSlots((previous) =>
          previous.map((slot) =>
            slot.id === slotId
              ? {
                  ...slot,
                  isUpdating: false,
                }
              : slot,
          ),
        );
        return;
      }

      setSlots((previous) =>
        previous.map((slot) => {
          if (slot.id !== slotId) {
            return slot;
          }

          return {
            ...slot,
            status,
            isUpdating: false,
          };
        }),
      );

      setSelectedSlotId(null);
    },
    [accessToken, adminEnabled, setSlots],
  );

  return {
    selectedSlotId,
    adminActionError,
    adminEnabled,
    openSlotMenu,
    closeSlotMenu,
    updateSlotStatusAsAdmin,
  };
};