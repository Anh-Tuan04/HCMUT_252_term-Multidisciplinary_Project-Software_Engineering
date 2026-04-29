import { useEffect, useRef, useState } from "react";

import carImage from "../../assets/MapPage/BlueCarTopView.svg";
import type { ParkingSlotView } from "../../types/parking";
import type { SlotVisualStatus } from "../../types/parking";

interface ParkingSlotCardProps {
  slot: ParkingSlotView;
  adminEnabled: boolean;
  isSelected: boolean;
  onSelect: (slotId: number) => void;
  onCloseMenu: () => void;
  onChangeStatus: (slotId: number, status: SlotVisualStatus) => void;
}

export const ParkingSlotCard = ({
  slot,
  adminEnabled,
  isSelected,
  onSelect,
  onCloseMenu,
  onChangeStatus,
}: ParkingSlotCardProps) => {
  const [animationClass, setAnimationClass] = useState("");
  const previousStatusRef = useRef(slot.status);
  const clickable = adminEnabled && !slot.isUpdating;

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const nextStatus = slot.status;

    if (previousStatus === nextStatus) {
      return;
    }

    if (previousStatus === "occupied" && nextStatus !== "occupied") {
      setAnimationClass("anim-out");
      window.setTimeout(() => {
        setAnimationClass("");
      }, 600);
    } else if (previousStatus !== "occupied" && nextStatus === "occupied") {
      setAnimationClass("anim-in");
      window.setTimeout(() => {
        setAnimationClass("");
      }, 600);
    }

    previousStatusRef.current = nextStatus;
  }, [slot.status]);

  return (
    <div
      className={`map-item map-item-${slot.orientation} state-${slot.status} ${isSelected ? "is-selecting" : ""} ${animationClass} ${adminEnabled ? "admin-enabled" : ""}`}
      aria-label={`Slot ${slot.name} status ${slot.status}`}
      onClick={() => {
        if (clickable) {
          onSelect(slot.id);
        }
      }}
    >
      <img className="car-visual" src={carImage} alt={`Slot ${slot.name}`} />
      <div className="warning-box" aria-hidden="true">
        <span className="warning-icon">⚠</span>
      </div>

      {adminEnabled ? (
        <div
          className="slot-menu"
          role="group"
          aria-label="Lựa chọn trạng thái"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="slot-menu-close"
            onClick={onCloseMenu}
          >
            ❌
          </button>
          <button
            type="button"
            className="slot-btn btn-occupied"
            onClick={() => onChangeStatus(slot.id, "occupied")}
          >
            Có xe
          </button>
          <button
            type="button"
            className="slot-btn btn-empty"
            onClick={() => onChangeStatus(slot.id, "empty")}
          >
            Còn trống
          </button>
          <button
            type="button"
            className="slot-btn btn-warning"
            onClick={() => onChangeStatus(slot.id, "warning")}
          >
            Bảo trì
          </button>
        </div>
      ) : null}
    </div>
  );
};
