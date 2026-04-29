import { ParkingSlotCard } from "./ParkingSlotCard";
import type { ParkingSlotView } from "../../types/parking";
import type { SlotVisualStatus } from "../../types/parking";

interface ParkingMapGridProps {
  slots: ParkingSlotView[];
  adminEnabled: boolean;
  selectedSlotId: number | null;
  onSelectSlot: (slotId: number) => void;
  onCloseSlotMenu: () => void;
  onChangeSlotStatus: (slotId: number, status: SlotVisualStatus) => void;
}

export const ParkingMapGrid = ({
  slots,
  adminEnabled,
  selectedSlotId,
  onSelectSlot,
  onCloseSlotMenu,
  onChangeSlotStatus,
}: ParkingMapGridProps) => {
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
  );
};
