import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { Lot } from "../../../interfaces";

type GateForm = {
  name: string;
  type: "ENTRY" | "EXIT";
  mac_address: string;
  is_active: boolean;
};

type Props = {
  show: boolean;
  creatingGate: boolean;
  selectedLot: Lot | null;
  gateForm: GateForm;
  setGateForm: Dispatch<SetStateAction<GateForm>>;
  onClose: () => void;
  onSubmit: () => void;
};

const CreateGateModal = ({
  show,
  creatingGate,
  selectedLot,
  gateForm,
  setGateForm,
  onClose,
  onSubmit,
}: Props) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" className="manage-lot-modal">
      <Modal.Header closeButton>
        <Modal.Title>Thêm gate mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="helper-text">
          Lot hiện tại:{" "}
          {selectedLot ? `${selectedLot.id} - ${selectedLot.name}` : "Khong co lot duoc chon"}
        </div>

        <div className="form-group mt-3">
          <label>Tên gate</label>
          <input
            type="text"
            className="form-control"
            value={gateForm.name}
            onChange={(e) => setGateForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Vi du: Cong 1"
          />
        </div>

        <div className="form-group mt-3">
          <label>Loại gate</label>
          <select
            className="form-select"
            value={gateForm.type}
            onChange={(e) =>
              setGateForm((prev) => ({ ...prev, type: e.target.value as "ENTRY" | "EXIT" }))
            }
          >
            <option value="ENTRY">ENTRY</option>
            <option value="EXIT">EXIT</option>
          </select>
        </div>

        <div className="form-group mt-3">
          <label>MAC address</label>
          <input
            type="text"
            className="form-control"
            value={gateForm.mac_address}
            onChange={(e) => setGateForm((prev) => ({ ...prev, mac_address: e.target.value }))}
            placeholder="Vi du: AA:BB:CC:DD:EE:FF"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={creatingGate}>
          {creatingGate ? "Dang tao..." : "Tao gate"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGateModal;
