import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";

import { addCard, findUserByEmail } from "../../../services/apiServices";
import type { CardStatusOption } from "./ManageCard";

import "./ManageCard.scss";

type ModelCreateCardProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  statusOptions: CardStatusOption[];
  refreshList: () => Promise<void> | void;
};

const ModelCreateCard = (props: ModelCreateCardProps) => {
  const { show, setShow, statusOptions, refreshList } = props;

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const [cardUid, setCardUid] = useState("");
  const [status, setStatus] = useState("REGISTERED");

  const resetForm = () => {
    setEmail("");
    setUserId(null);
    setCardUid("");
    setStatus("REGISTERED");
  };

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleFindUser = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      const res = await findUserByEmail(email);
      if (res?.data?.success) {
        const data = res?.data?.data || {};
        console.log("User data:", data);
        setUserId(data.user_id || null);
        toast.success("Đã tìm thấy user");
      } else {
        setUserId(null);
        toast.error(res?.data?.message || "Không tìm thấy user");
      }
    } catch {
      toast.error("Lỗi khi tìm user");
      setUserId(null);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Vui lòng chọn user hợp lệ");
      return;
    }

    if (!cardUid) {
      toast.error("Vui lòng nhập mã thẻ");
      return;
    }

    const payload = {
      uid: cardUid,
      card_type: status as "REGISTERED" | "GUEST",
      user_id: userId
    };

    const res = await addCard(payload);

    if (res?.data?.success) {
      toast.success("Tạo thẻ thành công");
      await refreshList();
      handleClose();
    } else {
      toast.error(res?.data?.message || "Tạo thẻ thất bại");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" className="model-card">
      <Modal.Header closeButton>
        <Modal.Title>Thêm thẻ mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="card-form">
          <div className="form-group">
            <label>Email user</label>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                value={email}
                placeholder="Nhập email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outline-primary" onClick={handleFindUser}>
                Tìm user
              </Button>
            </div>
            <div className="helper-text">
              User ID: {userId ?? "--"}
            </div>
          </div>

          <div className="form-group">
            <label>Mã thẻ</label>
            <input
              type="text"
              className="form-control"
              value={cardUid}
              placeholder="Nhập UID thẻ"
              onChange={(e) => setCardUid(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Loại thẻ</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions
                .filter((opt) => opt.value !== "")
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </select>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelCreateCard;
