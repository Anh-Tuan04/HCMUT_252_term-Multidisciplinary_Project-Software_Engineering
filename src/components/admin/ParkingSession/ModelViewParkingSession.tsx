import { useMemo } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import type { ManageParkingSession } from "../../../interfaces";

type ModelViewParkingSessionProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  dataView: ManageParkingSession;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chưa có";

  return new Date(value).toLocaleString("vi-VN", {
    hour12: false,
  });
};

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return "0 VNĐ";

  return value.toLocaleString("vi-VN") + " VNĐ";
};

const ModelViewParkingSession = (props: ModelViewParkingSessionProps) => {
  const { show, setShow, dataView } = props;

  const handleClose = () => {
    setShow(false);
  };

  const session = useMemo(
    () => ({
      id: dataView?.id || "",
      lotId: dataView?.lot_id || "",
      slotId: dataView?.slot_id || "Chưa gán",
      cardUid: dataView?.card_uid || "",
      cardType: dataView?.card_type || "",
      plateNumber: dataView?.plate_number || "",
      entryTime: formatDateTime(dataView?.entry_time),
      exitTime: formatDateTime(dataView?.exit_time),
      fee: formatMoney(dataView?.fee),
      status: dataView?.is_active ? "Đang gửi" : "Đã kết thúc",
      owner_name: dataView?.owner_name || "------",
    }),
    [dataView]
  );

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      className="model-parking-session"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết phiên gửi xe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form className="parking-session-form">
          <div className="row-group">
            <div className="form-group">
              <label>Trạng thái</label>
              <input className="form-control" value={session.status} disabled />
            </div>
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                className="form-control"
                value={session.owner_name}
                disabled
              />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>Biển số xe</label>
              <input
                className="form-control"
                value={session.plateNumber}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phí gửi xe</label>
              <input className="form-control" value={session.fee} disabled />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>Bãi xe</label>
              <input className="form-control" value={session.lotId} disabled />
            </div>

            <div className="form-group">
              <label>Vị trí đỗ</label>
              <input className="form-control" value={session.slotId} disabled />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>UID thẻ</label>
              <input className="form-control" value={session.cardUid} disabled />
            </div>

            <div className="form-group">
              <label>Loại thẻ</label>
              <input className="form-control" value={session.cardType} disabled />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>Thời gian vào</label>
              <input
                className="form-control"
                value={session.entryTime}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Thời gian ra</label>
              <input
                className="form-control"
                value={session.exitTime}
                disabled
              />
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelViewParkingSession;