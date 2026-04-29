import type { ApiClient, ApiResult } from "../http/apiTypes";
import type { SlotStatusUpdatedPayload } from "../../types/parking";
import type { AdminSlotStatus, ParkingSlotAdminGateway } from "./parkingSlotAdminGateway";

export class RestParkingSlotAdminGateway implements ParkingSlotAdminGateway {
  constructor(private readonly apiClient: ApiClient) {}

  updateSlotStatus(
    slotId: number,
    status: AdminSlotStatus,
    accessToken: string,
  ): Promise<ApiResult<SlotStatusUpdatedPayload>> {
    return this.apiClient.request<SlotStatusUpdatedPayload>({
      method: "PATCH",
      path: `/parking-slots/admin/${slotId}`,
      accessToken,
      body: {
        status,
      },
    });
  }
}
