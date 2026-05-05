import { useMemo } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { RfidCard } from "../../../interfaces";

import "./ManageCard.scss";

type ModelViewCardProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  dataView: RfidCard;
  statusLabelMap: Map<string, string>;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", { hour12: false });
};

const ModelViewCard = ({ show, setShow, dataView, statusLabelMap }: ModelViewCardProps) => {
  const handleClose = () => setShow(false);

  const card = useMemo(
    () => ({
      cardUid: dataView?.cardUid || "—",
      ownerName: dataView?.ownerName || "—",
      userId: dataView?.userId ?? "—",
      status: statusLabelMap.get(dataView?.status || "") || dataView?.status || "—",
      active: dataView?.isActive ? "Đã kích hoạt" : "Không hoạt động",
      registeredAt: formatDateTime(dataView?.registeredAt),
    }),
    [dataView, statusLabelMap]
  );

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" className="model-card">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết thẻ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="card-form">
          <div className="row-group">
            <div className="form-group">
              <label>Mã thẻ</label>
              <input className="form-control" value={card.cardUid} disabled />
            </div>
            <div className="form-group">
              <label>Ngày đăng ký</label>
              <input className="form-control" value={card.registeredAt} disabled />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>User ID</label>
              <input className="form-control" value={card.userId} disabled />
            </div>
            <div className="form-group">
              <label>Tên user</label>
              <input className="form-control" value={card.ownerName} disabled />
            </div>
          </div>

          <div className="row-group">
            <div className="form-group">
              <label>Loại thẻ</label>
              <input className="form-control" value={card.status} disabled />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <input className="form-control" value={card.active} disabled />
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

export default ModelViewCard;