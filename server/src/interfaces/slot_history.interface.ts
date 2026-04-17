import { SlotHistoryAction } from "@prisma/client";

export interface SlotHistoryUserDTO {
  id: number;
  email: string;
}

export interface SlotHistoryResponseDTO {
  id: number;
  slotId: number;
  oldDevice: string | null;
  newDevice: string | null;
  oldPort: number | null;
  newPort: number | null;
  action: SlotHistoryAction;
  createdAt: Date;
  user?: SlotHistoryUserDTO | null;
}