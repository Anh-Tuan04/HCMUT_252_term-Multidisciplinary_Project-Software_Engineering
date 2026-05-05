import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { getAllLot, getDashBoard } from "../../../services/apiServices";
import type { Lot } from "../../../interfaces";
import "./Dashboard.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HourlyFlow {
    hour: string;
    in: number;
    out: number;
}

interface DashboardData {
    date: string;
    lotId: number;
    lotName: string;
    summary: {
        todayIn: number;
        todayOut: number;
        currentVehicles: number;
        capacity: number;
        availableSlots: number;
        occupancyRate: number;
    };
    hourlyFlow: HourlyFlow[];
    insights: {
        peakTime: { from: string; to: string };
        occupancyStatus: "LOW" | "MEDIUM" | "HIGH" | "FULL";
        statusMessage: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayISO = () => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return formatter.format(new Date());
};

const occupancyStatusClass = (status: string) => {
    switch (status) {
        case "LOW":    return "status--low";
        case "MEDIUM": return "status--medium";
        case "HIGH":   return "status--high";
        case "FULL":   return "status--full";
        default:       return "";
    }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({
    icon,
    label,
    value,
    valueClass = "",
}: {
    icon: string;
    label: string;
    value: string;
    valueClass?: string;
}) => (
    <div className="info-row">
        <span className="info-row__icon">{icon}</span>
        <div>
            <p className="info-row__label">{label}</p>
            <p className={`info-row__value ${valueClass}`}>{value}</p>
        </div>
    </div>
);

const StatCard = ({
    icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: string;
    label: string;
    value: string;
    sub: string;
    accent: "blue" | "amber" | "green";
}) => (
    <div className={`stat-card stat-card--${accent}`}>
        <div className="stat-card__icon">{icon}</div>
        <div>
            <p className="stat-card__label">{label}</p>
            <p className="stat-card__value">{value}</p>
            <p className="stat-card__sub">{sub}</p>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Dashboard = () => {
    const [lots, setLots] = useState<Lot[]>([]);
    const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(todayISO());
    const [data, setData] = useState<DashboardData | null>(null);
    const [loadingLots, setLoadingLots] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // 1. Fetch lots on mount
    useEffect(() => {
        const fetchLots = async () => {
            try {
                setLoadingLots(true);
                const res = await getAllLot();
                const json = res.data;
                if (json.success) {
                    const lotList: Lot[] = json.data || [];
                    setLots(lotList);
                    if (lotList.length > 0) {
                        setSelectedLotId(lotList[0].id);
                    }
                }
            } catch (err) {
                console.error("fetchLots error:", err);
            } finally {
                setLoadingLots(false);
            }
        };
        fetchLots();
    }, []);

    // 2. Fetch dashboard when date or lotId changes
    useEffect(() => {
        if (selectedLotId === null) return;
        const fetchDashboard = async () => {
            try {
                setLoadingData(true);
                const res = await getDashBoard(selectedDate, selectedLotId);
                const json = res.data;
                if (json.success) {
                    setData(json.data as DashboardData);
                }
            } catch (err) {
                console.error("getDashBoard error:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchDashboard();
    }, [selectedDate, selectedLotId]);

    const chartData =
        data?.hourlyFlow.map((h) => ({
            hour: h.hour,
            "Xe vào": h.in,
            "Xe ra": h.out,
        })) ?? [];

    const summary  = data?.summary;
    const insights = data?.insights;

    return (
        <div className="dtd-wrapper">
            {/* ── Title + Filters ─────────────────────────────────────────── */}
            <h2 className="dtd-title">Biểu đồ lưu lượng xe hằng ngày</h2>

            <div className="dtd-filters">
                <div className="filter-box">
                    <span>📅</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="filter-box__date"
                    />
                </div>

                <div className="filter-box">
                    <span>📍</span>
                    <select
                        value={selectedLotId ?? ""}
                        onChange={(e) => setSelectedLotId(Number(e.target.value))}
                        disabled={loadingLots}
                        className="filter-box__select"
                    >
                        {lots.length === 0 && (
                            <option value="">
                                {loadingLots ? "Đang tải..." : "Không có bãi đỗ"}
                            </option>
                        )}
                        {lots.map((lot) => (
                            <option key={lot.id} value={lot.id}>
                                {lot.name} – {lot.location}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Chart + Info ─────────────────────────────────────────────── */}
            <div className="dtd-body">
                {/* Bar chart */}
                <div className="dtd-card dtd-card--chart">
                    <h3 className="dtd-card__title">Thống kê xe ra vào trong ngày</h3>

                    <p className="dtd-axis-label--y">Số lượng xe</p>
                    {loadingData ? (
                        <div className="dtd-loading">Đang tải dữ liệu...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 8, right: 8, left: -10, bottom: 8 }}
                                barCategoryGap="24%"
                                barGap={8}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="hour"
                                    interval={1}
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={48}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#64748b" }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: "1px solid #e2e8f0",
                                        fontSize: 13,
                                    }}
                                />
                                <Bar
                                    dataKey="Xe vào"
                                    fill="#4A90D9"
                                    radius={[4, 4, 0, 0]}
                                    barSize={18}
                                />
                                <Bar
                                    dataKey="Xe ra"
                                    fill="#F5B942"
                                    radius={[4, 4, 0, 0]}
                                    barSize={18}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    <div className="dtd-legend">
                        <span className="dtd-legend__item">
                            <svg width="12" height="12" style={{ flexShrink: 0 }}>
                                <rect x="0" y="0" width="12" height="12" rx="3" fill="#4A90D9" />
                            </svg>
                            Xe vào
                        </span>
                        <span className="dtd-legend__item">
                            <svg width="12" height="12" style={{ flexShrink: 0 }}>
                                <rect x="0" y="0" width="12" height="12" rx="3" fill="#F5B942" />
                            </svg>
                            Xe ra
                        </span>
                    </div>
                </div>

                {/* Info panel */}
                <div className="dtd-card dtd-card--info">
                    <h3 className="dtd-card__title">Thông tin bổ sung</h3>

                    <InfoRow
                        icon="🕐"
                        label="Khung giờ cao điểm"
                        value={
                            insights
                                ? `${insights.peakTime.from} - ${insights.peakTime.to}`
                                : "—"
                        }
                    />

                    <InfoRow
                        icon="🅿️"
                        label="Tỷ lệ lấp đầy bãi"
                        value={summary != null ? `${summary.occupancyRate}%` : "—"}
                    />

                    {insights && (
                        <div className={`status-badge ${occupancyStatusClass(insights.occupancyStatus)}`}>
                            <span className="status-badge__icon">⚠️</span>
                            <div>
                                <p className="status-badge__label">Trạng thái</p>
                                <p className="status-badge__value">{insights.statusMessage}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <div className="dtd-stats">
                <StatCard
                    icon="🚗"
                    label="Tổng xe vào hôm nay"
                    value={summary != null ? `${summary.todayIn} xe` : "—"}
                    sub="Tổng xe vào"
                    accent="blue"
                />
                <StatCard
                    icon="🚙"
                    label="Tổng xe ra hôm nay"
                    value={summary != null ? `${summary.todayOut} xe` : "—"}
                    sub="Tổng xe ra"
                    accent="amber"
                />
                <StatCard
                    icon="✅"
                    label="Xe hiện đang trong bãi"
                    value={summary != null ? `${summary.currentVehicles} xe` : "—"}
                    sub={
                        summary != null
                            ? `Còn ${summary.availableSlots} / ${summary.capacity} chỗ trống`
                            : ""
                    }
                    accent="green"
                />
            </div>
        </div>
    );
};

export default Dashboard;