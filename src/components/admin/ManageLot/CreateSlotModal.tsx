import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { Lot } from "../../../interfaces";

type SlotForm = {
  name: string;
  device_mac: string;
  port_number: string;
};

type Props = {
  show: boolean;
  creatingSlot: boolean;
  selectedLot: Lot | null;
  slotForm: SlotForm;
  setSlotForm: Dispatch<SetStateAction<SlotForm>>;
  onClose: () => void;
  onSubmit: () => void;
};

const CreateSlotModal = ({
  show,
  creatingSlot,
  selectedLot,
  slotForm,
  setSlotForm,
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
        <Modal.Title>Thêm slot mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="helper-text">
          Lot hiện tại:{" "}
          {selectedLot
            ? `${selectedLot.id} - ${selectedLot.name}`
            : "Không có lot được chọn"}
        </div>

        <div className="form-group mt-3">
          <label>Tên slot</label>
          <input
            type="text"
            className="form-control"
            value={slotForm.name}
            onChange={(e) =>
              setSlotForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Ví dụ: A9"
          />
        </div>

        <div className="form-group mt-3">
          <label>Device MAC</label>
          <input
            type="text"
            className="form-control"
            value={slotForm.device_mac}
            onChange={(e) =>
              setSlotForm((prev) => ({
                ...prev,
                device_mac: e.target.value,
              }))
            }
            placeholder="Ví dụ: SENSOR_A_001"
          />
        </div>

        <div className="form-group mt-3">
          <label>Port number</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={slotForm.port_number}
            onChange={(e) =>
              setSlotForm((prev) => ({
                ...prev,
                port_number: e.target.value,
              }))
            }
            placeholder="Ví dụ: 9"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>

        <Button variant="primary" onClick={onSubmit} disabled={creatingSlot}>
          {creatingSlot ? "Đang tạo..." : "Tạo slot"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateSlotModal;