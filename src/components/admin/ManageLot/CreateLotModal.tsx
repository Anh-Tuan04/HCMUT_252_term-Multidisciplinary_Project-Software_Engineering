import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

type LotForm = {
  name: string;
  location: string;
};

type Props = {
  show: boolean;
  creatingLot: boolean;
  lotForm: LotForm;
  setLotForm: Dispatch<SetStateAction<LotForm>>;
  onClose: () => void;
  onSubmit: () => void;
};

const CreateLotModal = ({
  show,
  creatingLot,
  lotForm,
  setLotForm,
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
        <Modal.Title>Thêm lot mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="form-group">
          <label>Tên lot</label>
          <input
            type="text"
            className="form-control"
            value={lotForm.name}
            onChange={(e) =>
              setLotForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Ví dụ: A"
          />
        </div>

        <div className="form-group mt-3">
          <label>Vị trí</label>
          <input
            type="text"
            className="form-control"
            value={lotForm.location}
            onChange={(e) =>
              setLotForm((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            placeholder="Ví dụ: Main Area"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>

        <Button variant="primary" onClick={onSubmit} disabled={creatingLot}>
          {creatingLot ? "Đang tạo..." : "Tạo lot"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateLotModal;