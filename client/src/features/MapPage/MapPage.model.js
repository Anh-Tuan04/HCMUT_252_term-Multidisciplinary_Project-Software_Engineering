// features/map/MapPage.model.js
export const initialMapState = {
    // 0: Trống, 1: Có xe, 2: FixingWarning
    slots: Array(8).fill(null).map((_, i) => ({
        id: i + 1,
        status: 0 
    }))
};

export const updateSlotStatus = (state, slotId, newStatus) => {
    const newSlots = state.slots.map(slot => 
        slot.id === slotId ? { ...slot, status: newStatus } : slot
    );
    return { ...state, slots: newSlots };
};