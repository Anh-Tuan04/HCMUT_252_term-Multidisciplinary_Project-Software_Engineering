import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";

import { updateCard, findUserByEmail } from "../../../services/apiServices";
import type { CardStatusOption } from "./ManageCard";
import type { RfidCard, UpdateCardDTO } from "../../../interfaces";

import "./ManageCard.scss";

type ModelUpdateCardProps = {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    dataUpdate: RfidCard;
    statusOptions: CardStatusOption[];
    refreshList: () => Promise<void> | void;
    resetUpdateData: () => void;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("vi-VN", { hour12: false });
};

const UpdateCardForm = ({
    dataUpdate,
    statusOptions,
    onSubmit,
    onCancel,
}: {
    dataUpdate: RfidCard;
    statusOptions: CardStatusOption[];
    onSubmit: (payload: UpdateCardDTO) => void;
    onCancel: () => void;
}) => {
    const [cardType, setCardType] = useState<"REGISTERED" | "GUEST">(
        dataUpdate.status === "GUEST" ? "GUEST" : "REGISTERED"
    );

    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState<number | null>(
        dataUpdate.userId ?? null
    );

    const [isActive, setIsActive] = useState<boolean>(
        dataUpdate.isActive ?? true
    );

    const card = useMemo(
        () => ({
            cardUid: dataUpdate?.cardUid || "—",
            ownerName: dataUpdate?.ownerName || "—",
            registeredAt: formatDateTime(dataUpdate?.registeredAt),
        }),
        [dataUpdate]
    );

    const handleChangeCardType = (value: "REGISTERED" | "GUEST") => {
        setCardType(value);

        if (value === "GUEST") {
            setEmail("");
            setUserId(null);
        }
    };

    const handleFindUser = async () => {
        const cleanEmail = email.trim();

        if (!cleanEmail) {
            toast.error("Vui lòng nhập email");
            return;
        }

        try {
            const res = await findUserByEmail(cleanEmail);

            if (res?.data?.success) {
                const data = res?.data?.data || {};
                const foundUserId = data.user_id;

                if (!foundUserId) {
                    setUserId(null);
                    toast.error("Không lấy được user_id");
                    return;
                }

                setUserId(foundUserId);
                toast.success("Đã tìm thấy user");
            } else {
                setUserId(null);
                toast.error(res?.data?.message || "Không tìm thấy user");
            }
        } catch {
            setUserId(null);
            toast.error("Lỗi khi tìm user");
        }
    };

    const handleSubmit = () => {
        if (cardType === "REGISTERED" && !userId) {
            toast.error("Thẻ đã đăng ký phải có User ID");
            return;
        }

        const payload: UpdateCardDTO = {
            card_type: cardType,
            is_active: isActive,
        };

        if (cardType === "REGISTERED") {
            payload.user_id = userId;
        } else {
            payload.user_id = null;
        }

        onSubmit(payload);
    };

    return (
        <>
            <Modal.Body>
                <form className="card-form">
                    <div className="row-group">
                        <div className="form-group">
                            <label>Mã thẻ</label>
                            <input
                                className="form-control"
                                value={card.cardUid}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày đăng ký</label>
                            <input
                                className="form-control"
                                value={card.registeredAt}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="row-group">
                        <div className="form-group">
                            <label>Loại thẻ</label>
                            <select
                                className="form-select"
                                value={cardType}
                                onChange={(e) =>
                                    handleChangeCardType(
                                        e.target.value as "REGISTERED" | "GUEST"
                                    )
                                }
                            >
                                {statusOptions
                                    .filter((option) => option.value !== "")
                                    .map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                className="form-select"
                                value={isActive ? "ACTIVE" : "INACTIVE"}
                                onChange={(e) =>
                                    setIsActive(e.target.value === "ACTIVE")
                                }
                            >
                                <option value="ACTIVE">Đã kích hoạt</option>
                                <option value="INACTIVE">
                                    Không hoạt động
                                </option>
                            </select>
                        </div>
                    </div>

                    {cardType === "REGISTERED" && (
                        <>
                            <div className="form-group">
                                <label>Email user</label>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        placeholder="Nhập email user"
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setUserId(null);
                                        }}
                                    />

                                    <Button
                                        variant="outline-primary"
                                        onClick={handleFindUser}
                                    >
                                        Tìm user
                                    </Button>
                                </div>

                                <div className="helper-text">
                                    User ID: {userId ?? "--"}
                                </div>
                            </div>

                            <div className="row-group">
                                <div className="form-group">
                                    <label>Tên user hiện tại</label>
                                    <input
                                        className="form-control"
                                        value={card.ownerName}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label>User ID gửi lên</label>
                                    <input
                                        className="form-control"
                                        value={userId ?? ""}
                                        disabled
                                        placeholder="Chưa chọn user"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {cardType === "GUEST" && (
                        <div className="helper-text">
                            Thẻ GUEST sẽ không gán user.
                        </div>
                    )}
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Đóng
                </Button>

                <Button variant="primary" onClick={handleSubmit}>
                    Lưu
                </Button>
            </Modal.Footer>
        </>
    );
};

const ModelUpdateCard = ({
    show,
    setShow,
    dataUpdate,
    statusOptions,
    refreshList,
    resetUpdateData,
}: ModelUpdateCardProps) => {
    const handleClose = () => {
        setShow(false);
        resetUpdateData();
    };

    const handleSubmit = async (payload: UpdateCardDTO) => {
        if (!dataUpdate?.id) return;

        try {
            const res = await updateCard(dataUpdate.id, payload);

            if (res?.data?.success) {
                toast.success("Cập nhật thẻ thành công");
                await refreshList();
                handleClose();
            } else {
                toast.error(res?.data?.message || "Cập nhật thẻ thất bại");
            }
        } catch {
            toast.error("Cập nhật thẻ thất bại");
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            className="model-card"
        >
            <Modal.Header closeButton>
                <Modal.Title>Cập nhật thẻ</Modal.Title>
            </Modal.Header>

            <UpdateCardForm
                key={dataUpdate?.id ?? "empty"}
                dataUpdate={dataUpdate}
                statusOptions={statusOptions}
                onSubmit={handleSubmit}
                onCancel={handleClose}
            />
        </Modal>
    );
};

export default ModelUpdateCard;