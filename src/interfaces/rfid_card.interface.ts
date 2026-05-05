export interface RfidCard {
    id: number;
    cardUid: string;
    userId?: number | null;
    ownerName?: string | null;
    status: "REGISTERED" | "GUEST";
    isActive: boolean;
    registeredAt: string;
}

export interface RfidCardListMeta {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

export type RfidCardListResponse = {
    data: RfidCard[];
    meta: RfidCardListMeta;
};

export interface UpdateCardDTO {
    user_id?: number | null;
    card_type: "REGISTERED" | "GUEST";
    is_active?: boolean;
};