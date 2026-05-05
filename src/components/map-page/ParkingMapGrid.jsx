import { ParkingSlotCard } from './ParkingSlotCard'

export function ParkingMapGrid({
	slots,
	adminEnabled,
	selectedSlotId,
	onSelectSlot,
	onCloseSlotMenu,
	onChangeSlotStatus,
}) {
	return (
		<div className="map-wrapper">
			<div className="map-container">
				{slots.map((slot) => (
					<ParkingSlotCard
						key={slot.id}
						slot={slot}
						adminEnabled={adminEnabled}
						isSelected={selectedSlotId === slot.id}
						onSelect={onSelectSlot}
						onCloseMenu={onCloseSlotMenu}
						onChangeStatus={onChangeSlotStatus}
					/>
				))}
			</div>
		</div>
	)
}
