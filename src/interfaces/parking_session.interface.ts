export type ParkingSession = {
  id: number;
  lot_id: number;
  slot_id?: number | null;
  card_uid: string;
  card_type: "REGISTERED" | "GUEST";
  plate_number: string;
  entry_time: string;
  exit_time?: string | null;
  fee?: number | null;
  is_active: boolean;
};

export type ManageParkingSession = {
  id: number;
  lot_id: number;
  slot_id?: number | null;
  card_uid: string;
  card_type: "REGISTERED" | "GUEST";
  plate_number: string;
  entry_time: string;
  exit_time?: string | null;
  fee?: number | null;
  is_active: boolean;
  owner_name?: string | null;
};

export type ParkingSessionMeta = {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};