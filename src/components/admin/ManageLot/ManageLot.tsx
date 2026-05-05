import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { BsFillPencilFill } from "react-icons/bs";
import { FaPenRuler } from "react-icons/fa6";
import { toast } from "react-toastify";

import {
  adminUpdateParkingSlot,
  changeDeviceMacForSlot,
  createLotForAdmin,
  createSlotForAdmin,
  getAllLot,
  getLotDetail,
} from "../../../services/apiServices";

import type {
  Lot,
  ParkingLotDetail,
  ParkingSlot,
  ParkingStats,
} from "../../../interfaces";

import CreateLotModal from "./CreateLotModal";
import CreateSlotModal from "./CreateSlotModal";
import UpdateSlotStatusModal from "./UpdateSlotStatusModal";
import UpdateSlotDeviceModal from "./UpdateSlotDeviceModal";

import "./ManageLot.scss";

type SlotStatusOption = "AVAILABLE" | "OCCUPIED" | "MAINTAIN";

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type LotForm = {
  name: string;
  location: string;
};

type SlotForm = {
  name: string;
  device_mac: string;
  port_number: string;
};

type DeviceForm = {
  device_mac: string;
  port_number: string;
};

const SLOT_STATUS_OPTIONS: SlotStatusOption[] = [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTAIN",
];

const statusLabel = (status: string) => {
  if (status === "AVAILABLE") return "Trống";
  if (status === "OCCUPIED") return "Đã đậu";
  if (status === "MAINTAIN") return "Bảo trì";
  return "Không xác định";
};

const statusClass = (status: string) => {
  if (status === "AVAILABLE") return "status-pill status-pill--available";
  if (status === "OCCUPIED") return "status-pill status-pill--occupied";
  if (status === "MAINTAIN") return "status-pill status-pill--maintain";
  return "status-pill";
};

const ManageLot = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [lotDetail, setLotDetail] = useState<ParkingLotDetail | null>(null);

  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creatingLot, setCreatingLot] = useState(false);
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [updatingStatusSlotId, setUpdatingStatusSlotId] =
    useState<number | null>(null);
  const [updatingDeviceSlotId, setUpdatingDeviceSlotId] =
    useState<number | null>(null);

  const [showCreateLotModal, setShowCreateLotModal] = useState(false);
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showUpdateDeviceModal, setShowUpdateDeviceModal] = useState(false);

  const [statusSlot, setStatusSlot] = useState<ParkingSlot | null>(null);
  const [deviceSlot, setDeviceSlot] = useState<ParkingSlot | null>(null);

  const [lotForm, setLotForm] = useState<LotForm>({
    name: "",
    location: "",
  });

  const [slotForm, setSlotForm] = useState<SlotForm>({
    name: "",
    device_mac: "",
    port_number: "",
  });

  const [statusForm, setStatusForm] =
    useState<SlotStatusOption>("AVAILABLE");

  const [deviceForm, setDeviceForm] = useState<DeviceForm>({
    device_mac: "",
    port_number: "",
  });

  const selectedLot = useMemo(
    () => lots.find((lot) => lot.id === selectedLotId) ?? null,
    [lots, selectedLotId]
  );

  const stats = useMemo<ParkingStats>(() => {
    if (lotDetail?.stats) return lotDetail.stats;

    if (!lotDetail?.slots?.length) {
      return {
        total: 0,
        available: 0,
        occupied: 0,
        maintain: 0,
      };
    }

    return lotDetail.slots.reduce<ParkingStats>(
      (acc, slot) => {
        acc.total += 1;

        if (slot.status === "AVAILABLE") acc.available += 1;
        if (slot.status === "OCCUPIED") acc.occupied += 1;
        if (slot.status === "MAINTAIN") acc.maintain += 1;

        return acc;
      },
      {
        total: 0,
        available: 0,
        occupied: 0,
        maintain: 0,
      }
    );
  }, [lotDetail]);

  const loadLots = async (preferredLotId?: number | null) => {
    try {
      setLoadingLots(true);

      const res = await getAllLot();
      const payload = res?.data as ApiResponse<Lot[]> | undefined;

      if (!payload?.success) {
        toast.error(payload?.message || "Không tải được danh sách bãi đỗ");
        setLots([]);
        setSelectedLotId(null);
        return;
      }

      const list = Array.isArray(payload.data) ? payload.data : [];
      setLots(list);

      if (list.length === 0) {
        setSelectedLotId(null);
        return;
      }

      const candidateId = preferredLotId ?? selectedLotId;

      const nextId =
        candidateId !== null &&
        candidateId !== undefined &&
        list.some((lot) => lot.id === candidateId)
          ? candidateId
          : list[0].id;

      setSelectedLotId(nextId);
    } catch {
      toast.error("Không tải được danh sách bãi đỗ");
      setLots([]);
      setSelectedLotId(null);
    } finally {
      setLoadingLots(false);
    }
  };

  const loadLotDetail = async (lotId: number) => {
    try {
      setLoadingDetail(true);

      const res = await getLotDetail(lotId);
      const payload = res?.data as ApiResponse<ParkingLotDetail> | undefined;

      if (!payload?.success || !payload?.data) {
        toast.error(payload?.message || "Không lấy được thông tin bãi đỗ");
        setLotDetail(null);
        return;
      }

      setLotDetail(payload.data);
    } catch {
      toast.error("Không lấy được thông tin bãi đỗ");
      setLotDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadLots();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedLotId === null) {
        setLotDetail(null);
        return;
      }

      loadLotDetail(selectedLotId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedLotId]);

  const resetLotForm = () => {
    setLotForm({
      name: "",
      location: "",
    });
  };

  const resetSlotForm = () => {
    setSlotForm({
      name: "",
      device_mac: "",
      port_number: "",
    });
  };

  const handleCreateLot = async () => {
    const name = lotForm.name.trim();
    const location = lotForm.location.trim();

    if (!name || !location) {
      toast.error("Vui lòng nhập tên và vị trí cho bãi đỗ");
      return;
    }

    try {
      setCreatingLot(true);

      const res = await createLotForAdmin(name, location);

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Thêm bãi đỗ thất bại");
        return;
      }

      toast.success(res?.data?.message || "Thêm bãi đỗ thành công");

      setShowCreateLotModal(false);
      resetLotForm();

      await loadLots(res?.data?.data?.id ?? null);
    } catch {
      toast.error("Thêm bãi đỗ thất bại");
    } finally {
      setCreatingLot(false);
    }
  };

  const handleCreateSlot = async () => {
    if (selectedLotId === null) {
      toast.error("Vui lòng chọn bãi đỗ trước");
      return;
    }

    const name = slotForm.name.trim();
    const deviceMac = slotForm.device_mac.trim();
    const portNumber = Number(slotForm.port_number);

    if (!name || !deviceMac || !slotForm.port_number.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin slot");
      return;
    }

    if (!Number.isInteger(portNumber) || portNumber <= 0) {
      toast.error("Port number phải là số nguyên dương");
      return;
    }

    try {
      setCreatingSlot(true);

      const res = await createSlotForAdmin(
        selectedLotId,
        name,
        deviceMac,
        portNumber
      );

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Thêm slot thất bại");
        return;
      }

      toast.success(res?.data?.message || "Thêm slot thành công");

      setShowCreateSlotModal(false);
      resetSlotForm();

      await loadLotDetail(selectedLotId);
    } catch {
      toast.error("Thêm slot thất bại");
    } finally {
      setCreatingSlot(false);
    }
  };

  const openUpdateStatusModal = (slot: ParkingSlot) => {
    setStatusSlot(slot);
    setStatusForm(slot.status as SlotStatusOption);
    setShowUpdateStatusModal(true);
  };

  const openUpdateDeviceModal = (slot: ParkingSlot) => {
    setDeviceSlot(slot);
    setDeviceForm({
      device_mac: slot.device_mac || "",
      port_number: slot.port_number ? String(slot.port_number) : "",
    });
    setShowUpdateDeviceModal(true);
  };

  const closeUpdateStatusModal = () => {
    setShowUpdateStatusModal(false);
    setStatusSlot(null);
    setStatusForm("AVAILABLE");
  };

  const closeUpdateDeviceModal = () => {
    setShowUpdateDeviceModal(false);
    setDeviceSlot(null);
    setDeviceForm({
      device_mac: "",
      port_number: "",
    });
  };

  const handleUpdateStatus = async () => {
    if (!statusSlot) return;

    if (statusForm === statusSlot.status) {
      toast.info("Không có thay đổi nào về trạng thái");
      return;
    }

    try {
      setUpdatingStatusSlotId(statusSlot.id);

      const res = await adminUpdateParkingSlot(statusSlot.id, statusForm);

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Cập nhật trạng thái thất bại");
        return;
      }

      toast.success(res?.data?.message || "Cập nhật trạng thái thành công");

      if (selectedLotId !== null) {
        await loadLotDetail(selectedLotId);
      }

      closeUpdateStatusModal();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingStatusSlotId(null);
    }
  };

  const handleUpdateDevice = async () => {
    if (!deviceSlot) return;

    const deviceMac = deviceForm.device_mac.trim();
    const portText = deviceForm.port_number.trim();
    const portNumber = Number(portText);

    const currentDeviceMac = (deviceSlot.device_mac || "").trim();
    const currentPort = Number(deviceSlot.port_number || 0);

    if (!deviceMac) {
      toast.error("Device MAC không được để trống");
      return;
    }

    if (!portText || !Number.isInteger(portNumber) || portNumber <= 0) {
      toast.error("Port number phải là số nguyên dương");
      return;
    }

    if (deviceMac === currentDeviceMac && portNumber === currentPort) {
      toast.info("Không có thay đổi nào về thiết bị");
      return;
    }

    try {
      setUpdatingDeviceSlotId(deviceSlot.id);

      const res = await changeDeviceMacForSlot(
        deviceSlot.id,
        deviceMac,
        portNumber
      );

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Cập nhật thiết bị thất bại");
        return;
      }

      toast.success(res?.data?.message || "Cập nhật thiết bị thành công");

      if (selectedLotId !== null) {
        await loadLotDetail(selectedLotId);
      }

      closeUpdateDeviceModal();
    } catch {
      toast.error("Cập nhật thiết bị thất bại");
    } finally {
      setUpdatingDeviceSlotId(null);
    }
  };

  return (
    <div className="manage-lot-container">
      <div className="header">
        <div>
          <h2 className="title">Quản lý bãi đỗ</h2>
        </div>

        <div className="actions">
          <button
            className="btn-refresh"
            onClick={() => {
              if (selectedLotId !== null) {
                loadLotDetail(selectedLotId);
              } else {
                loadLots();
              }
            }}
          >
            <FaSyncAlt /> Làm mới
          </button>

          <button
            className="btn-create"
            onClick={() => setShowCreateLotModal(true)}
          >
            <FaPlus /> Thêm Lot
          </button>

          <button
            className="btn-create btn-create--secondary"
            onClick={() => setShowCreateSlotModal(true)}
            disabled={selectedLotId === null}
          >
            <FaPlus /> Thêm Slot
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card summary-card--lot">
          <p>Tổng số Lot</p>
          <strong>{lots.length}</strong>
        </div>

        <div className="summary-card summary-card--available">
          <p>Slot trống</p>
          <strong>{stats.available}</strong>
        </div>

        <div className="summary-card summary-card--occupied">
          <p>Slot đã sử dụng</p>
          <strong>{stats.occupied}</strong>
        </div>

        <div className="summary-card summary-card--maintain">
          <p>Slot đang bảo trì</p>
          <strong>{stats.maintain}</strong>
        </div>
      </div>

      <div className="lot-panel">
        <label htmlFor="lot-select">Chọn Lot</label>

        <select
          id="lot-select"
          value={selectedLotId ?? ""}
          onChange={(e) => setSelectedLotId(Number(e.target.value))}
          disabled={loadingLots || lots.length === 0}
        >
          {lots.length === 0 ? (
            <option value="">
              {loadingLots ? "Đang tải..." : "Chưa có lot"}
            </option>
          ) : (
            lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.id} - {lot.name} - {lot.location}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h3>Bảng quản lý Slot</h3>
            <p>
              {selectedLot
                ? `Lot: ${selectedLot.name} - ${selectedLot.location}`
                : "Không có lot được chọn"}
            </p>
          </div>

          <span className="total-slot">Tổng slot: {stats.total}</span>
        </div>

        <div className="slot-table">
          <table className="table table-hover table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên slot</th>
                <th>Trạng thái hiện tại</th>
                <th>Device MAC hiện tại</th>
                <th>Port hiện tại</th>
                <th>Sửa status</th>
                <th>Sửa thiết bị</th>
              </tr>
            </thead>

            <tbody>
              {loadingDetail && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Đang tải thông tin Lot...
                  </td>
                </tr>
              )}

              {!loadingDetail &&
                lotDetail?.slots?.map((slot) => (
                  <tr key={slot.id}>
                    <td>{slot.id}</td>
                    <td>{slot.name}</td>

                    <td>
                      <span className={statusClass(slot.status)}>
                        {statusLabel(slot.status)}
                      </span>
                    </td>

                    <td>{slot.device_mac || "-"}</td>
                    <td>{slot.port_number || "-"}</td>

                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => openUpdateStatusModal(slot)}
                      >
                        <FaPenRuler style={{ fontSize: "1rem" }} />
                      </button>
                    </td>

                    <td>
                      <button
                        className="btn btn-warning"
                        onClick={() => openUpdateDeviceModal(slot)}
                      >
                        <BsFillPencilFill style={{ fontSize: "1rem" }} />
                      </button>
                    </td>
                  </tr>
                ))}

              {!loadingDetail && !lotDetail?.slots?.length && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Chưa có slot nào trong lot này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateLotModal
        show={showCreateLotModal}
        creatingLot={creatingLot}
        lotForm={lotForm}
        setLotForm={setLotForm}
        onClose={() => {
          setShowCreateLotModal(false);
          resetLotForm();
        }}
        onSubmit={handleCreateLot}
      />

      <CreateSlotModal
        show={showCreateSlotModal}
        creatingSlot={creatingSlot}
        selectedLot={selectedLot}
        slotForm={slotForm}
        setSlotForm={setSlotForm}
        onClose={() => {
          setShowCreateSlotModal(false);
          resetSlotForm();
        }}
        onSubmit={handleCreateSlot}
      />

      <UpdateSlotStatusModal
        show={showUpdateStatusModal}
        statusSlot={statusSlot}
        statusForm={statusForm}
        setStatusForm={setStatusForm}
        statusOptions={SLOT_STATUS_OPTIONS}
        statusLabel={statusLabel}
        updatingStatusSlotId={updatingStatusSlotId}
        onClose={closeUpdateStatusModal}
        onSubmit={handleUpdateStatus}
      />

      <UpdateSlotDeviceModal
        show={showUpdateDeviceModal}
        deviceSlot={deviceSlot}
        deviceForm={deviceForm}
        setDeviceForm={setDeviceForm}
        updatingDeviceSlotId={updatingDeviceSlotId}
        onClose={closeUpdateDeviceModal}
        onSubmit={handleUpdateDevice}
      />
    </div>
  );
};

export default ManageLot;