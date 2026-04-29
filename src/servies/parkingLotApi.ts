import { toVisualStatus } from "../utils/slotMapper";
import type { ApiClient, ApiResult } from "./http/apiTypes";

interface ParkingLotSlotResponse {
  id?: number;
  name?: string;
  status?: string;
}

interface ParkingLotDetailResponse {
  slots?: ParkingLotSlotResponse[];
}

export interface ParkingLotSnapshotSlot {
  id?: number;
  name?: string;
  status?: "empty" | "occupied" | "warning";
}

export interface ParkingLotGateway {
  getSlots(lotId: number, accessToken: string): Promise<ApiResult<ParkingLotSnapshotSlot[]>>;
}

export class RestParkingLotGateway implements ParkingLotGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async getSlots(lotId: number, accessToken: string): Promise<ApiResult<ParkingLotSnapshotSlot[]>> {
    const result = await this.apiClient.request<ParkingLotDetailResponse>({
      method: "GET",
      path: `/parking-lots/${lotId}`,
      accessToken,
    });

    if (!result.success || !result.data) {
      return {
        ...result,
        data: null,
      };
    }

    const slots = Array.isArray(result.data.slots) ? result.data.slots : [];

    const mapped = slots.map((slot) => ({
      id: typeof slot.id === "number" ? slot.id : undefined,
      name: typeof slot.name === "string" ? slot.name : undefined,
      status: toVisualStatus(slot.status),
    }));

    return {
      success: true,
      status: result.status,
      message: result.message,
      errors: [],
      data: mapped,
    };
  }
}
