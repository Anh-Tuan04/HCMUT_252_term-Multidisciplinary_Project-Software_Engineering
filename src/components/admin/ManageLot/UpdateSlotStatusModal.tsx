import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { ParkingSlot } from "../../../interfaces";

type SlotStatusOption = "AVAILABLE" | "OCCUPIED" | "MAINTAIN";

type Props = {
  show: boolean;
  statusSlot: ParkingSlot | null;
  statusForm: SlotStatusOption;
  setStatusForm: Dispatch<SetStateAction<SlotStatusOption>>;
  statusOptions: SlotStatusOption[];
  statusLabel: (status: string) => string;
  updatingStatusSlotId: number | null;
  onClose: () => void;
  onSubmit: () => void;
};

const UpdateSlotStatusModal = ({
  show,
  statusSlot,
  statusForm,
  setStatusForm,
  statusOptions,
  statusLabel,
  updatingStatusSlotId,
  onClose,
  onSubmit,
}: Props) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      className="manage-lot-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật trạng thái</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="form-group">
          <label>Tên slot</label>
          <input
            type="text"
            className="form-control"
            value={statusSlot?.name || ""}
            disabled
          />
        </div>

        <div className="form-group mt-3">
          <label>Trạng thái mới</label>

          <select
            className="form-select"
            value={statusForm}
            onChange={(e) =>
              setStatusForm(e.target.value as SlotStatusOption)
            }
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </select>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={updatingStatusSlotId !== null}
        >
          {updatingStatusSlotId !== null ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateSlotStatusModal;