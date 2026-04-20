package vehicle_log

type GetLogsBySlotIDParams struct {
	SlotID uint `uri:"slotId" binding:"required"`
}
