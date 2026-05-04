export interface Lot{
  id: number;
  name: string;
  location: string;
};

export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTAIN" | "MAINTENANCE";

export interface ParkingSlot{
  id: number;
  name: string;
  status: SlotStatus;
  device_mac?: string;
  port_number?: number;
};

export interface ParkingStats{
  total: number;
  available: number;
  occupied: number;
  maintain: number;
};

export interface ParkingLotDetail{
  id: number;
  name: string;
  location: string;
  slots: ParkingSlot[];
  stats: ParkingStats;
};
