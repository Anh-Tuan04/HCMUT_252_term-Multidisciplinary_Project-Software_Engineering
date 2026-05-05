import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { ParkingSlot } from "../../../interfaces";

type DeviceForm = {
  device_mac: string;
  port_number: string;
};

type Props = {
  show: boolean;
  deviceSlot: ParkingSlot | null;
  deviceForm: DeviceForm;
  setDeviceForm: Dispatch<SetStateAction<DeviceForm>>;
  updatingDeviceSlotId: number | null;
  onClose: () => void;
  onSubmit: () => void;
};

const UpdateSlotDeviceModal = ({
  show,
  deviceSlot,
  deviceForm,
  setDeviceForm,
  updatingDeviceSlotId,
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
        <Modal.Title>Cập nhật thiết bị slot</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="form-group">
          <label>Tên slot</label>
          <input
            type="text"
            className="form-control"
            value={deviceSlot?.name || ""}
            disabled
          />
        </div>

        <div className="form-group mt-3">
          <label>Device MAC</label>
          <input
            type="text"
            className="form-control"
            value={deviceForm.device_mac}
            onChange={(e) =>
              setDeviceForm((prev) => ({
                ...prev,
                device_mac: e.target.value,
              }))
            }
          />
        </div>

        <div className="form-group mt-3">
          <label>Port number</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={deviceForm.port_number}
            onChange={(e) =>
              setDeviceForm((prev) => ({
                ...prev,
                port_number: e.target.value,
              }))
            }
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={updatingDeviceSlotId !== null}
        >
          {updatingDeviceSlotId !== null ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateSlotDeviceModal;