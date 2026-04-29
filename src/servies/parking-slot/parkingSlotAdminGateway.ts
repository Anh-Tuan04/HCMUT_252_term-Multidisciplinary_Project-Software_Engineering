import type { ApiResult } from "../http/apiTypes";
import type { SlotStatusUpdatedPayload } from "../../types/parking";

export type AdminSlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTAIN";

export interface ParkingSlotAdminGateway {
  updateSlotStatus(
    slotId: number,
    status: AdminSlotStatus,
    accessToken: string,
  ): Promise<ApiResult<SlotStatusUpdatedPayload>>;
}
