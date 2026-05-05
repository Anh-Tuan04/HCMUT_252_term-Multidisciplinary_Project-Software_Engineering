import { useEffect, useMemo, useRef, useState } from "react";
import "./ParkingLotStatus.scss";
import BlueCarTopView from "../../assets/BlueCarTopView.svg";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import type {
    Lot,
    ParkingLotDetail,
    ParkingSlot,
    SlotStatus,
} from "../../interfaces";

import {
    getParkingLots,
    getParkingLotDetail,
    logout
} from "../../services/apiServices";
import { doLogout } from "../../redux/slices/userSlice";
import { FaHome, FaRegUser, FaCog } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

type SlotAnimation = "car-in" | "car-out" | "";

const getStatusLabel = (status: SlotStatus) => {
    switch (status) {
        case "AVAILABLE":
            return "Trống";
        case "OCCUPIED":
            return "Đã đỗ";
        case "MAINTAIN":
            return "Bảo trì";
        default:
            return status;
    }
};

const getStatusClass = (status: SlotStatus) => {
    switch (status) {
        case "AVAILABLE":
            return "available";
        case "OCCUPIED":
            return "occupied";
        case "MAINTAIN":
            return "maintenance";
        default:
            return "available";
    }
};

const ParkingLotStatus = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { account } = useAppSelector((state) => state.user);
    const isAdmin = account?.role?.toUpperCase() === "ADMIN";

    // Quản lý trạng thái mở menu
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [lots, setLots] = useState<Lot[]>([]);
    const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
    const [lotDetail, setLotDetail] = useState<ParkingLotDetail | null>(null);

    const [loadingLots, setLoadingLots] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const previousSlotsRef = useRef<Record<number, SlotStatus>>({});
    const [slotAnimations, setSlotAnimations] = useState<
        Record<number, SlotAnimation>
    >({});

    const currentTime = useCurrentTime();

    const fetchLots = async () => {
        try {
        setLoadingLots(true);

        const res = await getParkingLots();
        const json = res.data;

        if (json.success) {
            const lotList: Lot[] = json.data || [];
            setLots(lotList);

            if (lotList.length > 0) {
                setSelectedLotId(lotList[0].id);
            }
        }
        } catch (error) {
            console.error("Fetch lots error:", error);
        } finally {
            setLoadingLots(false);
        }
    };

    const fetchLotDetail = async (lotId: number, silent = false) => {
        try {
        if (!silent) setLoadingDetail(true);
        setRefreshing(true);

        const res = await getParkingLotDetail(lotId);
        const json = res.data;

        if (json.success) {
            const nextDetail: ParkingLotDetail = json.data;

            applySlotAnimation(nextDetail.slots);
            setLotDetail(nextDetail);
        }
        } catch (error) {
            console.error("Fetch lot detail error:", error);
        } finally {
            setLoadingDetail(false);
            setRefreshing(false);
        }
    };

    const applySlotAnimation = (newSlots: ParkingSlot[]) => {
        const previousSlots = previousSlotsRef.current;
        const nextAnimations: Record<number, SlotAnimation> = {};

        newSlots.forEach((slot) => {
            const currentStatus = slot.status;
            const previousStatus = previousSlots[slot.id];

            if (!previousStatus || previousStatus === currentStatus) return;

            if (previousStatus === "AVAILABLE" && currentStatus === "OCCUPIED") {
                nextAnimations[slot.id] = "car-in";
            }

            if (previousStatus === "OCCUPIED" && currentStatus === "AVAILABLE") {
                nextAnimations[slot.id] = "car-out";
            }
        });

        previousSlotsRef.current = newSlots.reduce<Record<number, SlotStatus>>(
            (acc, slot) => {
                acc[slot.id] = slot.status;
                return acc;
            },
            {}
        );

        setSlotAnimations(nextAnimations);

        window.setTimeout(() => {
            setSlotAnimations({});
        }, 950);
    };

    const handleLogout = async () => {
        try {
            await logout(); // Gọi API xóa cookie/session
        } catch (err) {
            console.error('Logout request failed', err);
        }
        dispatch(doLogout()); // Xóa state trong Redux
        setShowMenu(false);
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowMenu(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
    const timer = window.setTimeout(() => {
        fetchLots();
    }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (selectedLotId === null) return;

        previousSlotsRef.current = {};

        const timer = window.setTimeout(() => {
            setLotDetail(null);
            fetchLotDetail(selectedLotId);
        }, 0);

        return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLotId]);

    useEffect(() => {
        if (selectedLotId === null) return;

        const timer = window.setInterval(() => {
            fetchLotDetail(selectedLotId, true);
        }, 5000);

        return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLotId]);

    const activeLotDetail =
        lotDetail && selectedLotId && lotDetail.id === selectedLotId
        ? lotDetail
        : null;

    const selectedLot = lots.find((lot) => lot.id === selectedLotId);

    const stats = useMemo(() => {
        if (!activeLotDetail) {
        return {
            total: 0,
            available: 0,
            occupied: 0,
            maintain: 0,
        };
        }

        return activeLotDetail.stats;
    }, [activeLotDetail]);

    const availablePercent = stats.total
        ? Math.round((stats.available / stats.total) * 100)
        : 0;

    const occupiedPercent = stats.total
        ? Math.round((stats.occupied / stats.total) * 100)
        : 0;

    const maintainPercent = stats.total
        ? Math.round((stats.maintain / stats.total) * 100)
        : 0;

    const selectedLotText = activeLotDetail
        ? `${activeLotDetail.id} - ${activeLotDetail.name} - ${activeLotDetail.location}`
        : selectedLot
        ? `${selectedLot.id} - ${selectedLot.name} - ${selectedLot.location}`
        : "Đang tải...";

    return (
        <div className="parking-page">
            <div className="parking-bg parking-bg--one" />
            <div className="parking-bg parking-bg--two" />

            <div className="top-navigation" ref={menuRef}>
                <span className="user-name">
                    Xin chào, {account?.first_name || "User"}
                </span>

                <div className="avatar-container">
                    {/* Nút Avatar */}
                    <button
                        onClick={() => setShowMenu((prev) => !prev)}
                        className="avatar-btn"
                    >
                        <img
                            src={`https://ui-avatars.com/api/?name=${account?.first_name + " " + account?.last_name || "User"}&background=35b9f3&color=fff`}
                            alt="Avatar"
                            className="img"
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="dropdown-menu">
                            <button
                                onClick={() => { setShowMenu(false); navigate("/"); }}
                                className="dropdown-item"
                            >
                                <FaHome className="dropdown-icon icon1" />
                                Trang chủ
                            </button>

                            <button
                                onClick={() => { setShowMenu(false); navigate("/user"); }}
                                className="dropdown-item"
                            >
                                <FaRegUser className="dropdown-icon icon2" />
                                Trang cá nhân
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => { setShowMenu(false); navigate("/admin"); }}
                                    className="dropdown-item"
                                >
                                    <FaCog className="dropdown-icon icon3" />
                                    Quản trị hệ thống
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="dropdown-item"
                            >
                                <FiLogOut className="dropdown-icon icon4" />
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <header className="parking-header">
                <div className="time-card">
                    <div className="time-card__time">{currentTime.time}</div>
                    <div className="time-card__date">{currentTime.date}</div>
                </div>

                <div className="lot-card">
                    <div className="lot-card__info">
                        <p className="section-label">Bãi đỗ đang xem</p>
                        <h2>{selectedLotText}</h2>
                    </div>

                    <select
                        value={selectedLotId ?? ""}
                        onChange={(e) => setSelectedLotId(Number(e.target.value))}
                        disabled={loadingLots}
                    >
                        {lots.length === 0 && (
                        <option value="">
                            {loadingLots ? "Đang tải bãi đỗ..." : "Không có bãi đỗ"}
                        </option>
                        )}

                        {lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                            {lot.id} - {lot.name} - {lot.location}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="summary-card">
                    <SummaryItem
                        label="Trống"
                        value={stats.available}
                        total={stats.total}
                        type="available"
                    />

                    <SummaryItem
                        label="Đã đỗ"
                        value={stats.occupied}
                        total={stats.total}
                        type="occupied"
                    />

                    <SummaryItem
                        label="Bảo trì"
                        value={stats.maintain}
                        total={stats.total}
                        type="maintain"
                    />
                </div>
            </header>

            <main className="parking-main">
                <section className="overview-panel">
                    <div className="overview-card overview-card--available">
                        <div>
                            <p>Ô trống</p>
                            <strong>{stats.available}</strong>
                        </div>
                        <CircularProgress percent={availablePercent} />
                    </div>

                    <div className="overview-card overview-card--occupied">
                        <div>
                            <p>Đã đỗ</p>
                            <strong>{stats.occupied}</strong>
                        </div>
                        <CircularProgress percent={occupiedPercent} />
                    </div>

                    <div className="overview-card overview-card--maintenance">
                        <div>
                        <p>Bảo trì</p>
                        <strong>{stats.maintain}</strong>
                        </div>
                        <CircularProgress percent={maintainPercent} />
                    </div>
                </section>

                <section className="parking-board-card">
                    <div className="board-header">
                        <div>
                            <p className="section-label">Sơ đồ bãi đỗ</p>
                            <h3>
                                {activeLotDetail
                                    ? `Khu ${activeLotDetail.name}`
                                    : "Đang tải dữ liệu"}
                            </h3>
                        </div>

                        <button
                            className={`refresh-btn ${refreshing ? "is-spinning" : ""}`}
                            onClick={() => {
                                if (selectedLotId !== null) {
                                fetchLotDetail(selectedLotId);
                                }
                            }}
                            disabled={selectedLotId === null}
                        >
                            <RefreshIcon />
                            <span>Làm mới</span>
                        </button>
                    </div>

                    <div className={`parking-board ${loadingDetail ? "is-loading" : ""}`}>
                        {activeLotDetail?.slots.map((slot) => {
                            const status = slot.status;
                            const statusClass = getStatusClass(status);
                            const animation = slotAnimations[slot.id] || "";

                            return (
                                <div
                                    key={slot.id}
                                    className={`parking-slot parking-slot--${statusClass} ${animation}`}
                                >
                                    <div className="slot-top">
                                        <span className="slot-name">{slot.name}</span>
                                        <span className="slot-status">
                                        {getStatusLabel(status)}
                                        </span>
                                    </div>

                                    {status === "MAINTAIN" && (
                                        <div className="warning-corner" title="Ô đang bảo trì" />
                                    )}

                                    <div className="slot-content">
                                        {status === "OCCUPIED" && (
                                            <div className="car">
                                                <img src={BlueCarTopView} alt="Xe đang đỗ" />
                                            </div>
                                        )}

                                        {status === "AVAILABLE" && animation === "car-out" && (
                                            <div className="car car--ghost">
                                                <img src={BlueCarTopView} alt="Xe rời khỏi ô đỗ" />
                                            </div>
                                        )}

                                        {status === "AVAILABLE" && animation !== "car-out" && (
                                        <div className="empty-slot">
                                            <span>Trống</span>
                                        </div>
                                        )}

                                        {status === "MAINTAIN" && (
                                        <div className="maintenance-box">
                                            <div className="maintenance-triangle">!</div>
                                            <p>Đang bảo trì</p>
                                        </div>
                                        )}
                                    </div>

                                    <div className="slot-footer">
                                        <span>{slot.device_mac || "No device"}</span>
                                        <span>Port {slot.port_number || "-"}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {!activeLotDetail && (
                        <div className="board-empty">
                            <div className="board-loader" />
                            <p>Đang tải trạng thái bãi đỗ...</p>
                        </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
    };

    const SummaryItem = ({
        label,
        value,
        total,
        type,
    }: {
        label: string;
        value: number;
        total: number;
        type: "available" | "occupied" | "maintain";
    }) => {
        return (
            <div className={`summary-item summary-item--${type}`}>
                <p>{label}</p>
                <strong>
                    {value}/{total}
                </strong>
            </div>
        );
    };

    const CircularProgress = ({ percent }: { percent: number }) => {
        const progressAngle = `${percent * 3.6}deg`;

        return (
            <div
                className="circle-progress"
                style={{
                    background: `radial-gradient(closest-side, #fff 72%, transparent 73%), conic-gradient(currentColor ${progressAngle}, rgba(23, 50, 77, 0.08) 0)`,
                }}
            >
                <span>{percent}%</span>
            </div>
        );
    };

    const useCurrentTime = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return {
        time: date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
        }),
        date: date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Ho_Chi_Minh",
        }),
    };
};

    const RefreshIcon = () => (
        <svg viewBox="0 0 24 24" fill="none">
            <path
                d="M21 12a9 9 0 0 1-15.2 6.5M3 12A9 9 0 0 1 18.2 5.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path
                d="M6 19H2v-4M18 5h4v4"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    export default ParkingLotStatus;