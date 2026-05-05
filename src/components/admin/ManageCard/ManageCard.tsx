import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";

import TableCardPaginate from "./TableCardPaginate";
import ModelCreateCard from "./ModelCreateCard";
import ModelUpdateCard from "./ModelUpdateCard";
import ModelViewCard from "./ModelViewCard";
import { getCard, getNumberCard } from "../../../services/apiServices";

import type { RfidCard, RfidCardListResponse } from "../../../interfaces";

import "./ManageCard.scss";

export type CardStatusOption = {
    value: string;
    label: string;
};

type SummaryData = {
    total: number;
    registered: number;
    guest: number;
    active: number;
};

const CARD_STATUS_OPTIONS: CardStatusOption[] = [
    { value: "", label: "Tất cả" },
    { value: "REGISTERED", label: "Đã đăng ký" },
    { value: "GUEST", label: "Chưa đăng ký" },
];

const PAGE_SIZE = 6;

const ManageCard = () => {
    const [listCards, setListCards] = useState<RfidCard[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [keyword, setKeyword] = useState("");

    const [selectedStatus, setSelectedStatus] = useState("");

    const [summary, setSummary] = useState<SummaryData>({
        total: 0,
        registered: 0,
        guest: 0,
        active: 0,
    });

    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showView, setShowView] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<RfidCard>({} as RfidCard);

    const loadSummary = async () => {
        try {
            const res = await getNumberCard();

            if (res?.data?.success) {
                const data = res?.data?.data;

                setSummary({
                    total: data.totalCards || 0,
                    registered: data.registeredCards || 0,
                    guest: data.unregisteredCards || 0,
                    active: data.activeCards || 0,
                });
            }
        } catch {
            setSummary({
                total: 0,
                registered: 0,
                guest: 0,
                active: 0,
            });
        }
    };

    const fetchCards = useCallback(
        async (
            page = 1,
            keywordValue = keyword,
            statusValue = selectedStatus
        ) => {
            try {
                const res = await getCard(
                    statusValue || "",
                    page,
                    PAGE_SIZE,
                    keywordValue.trim()
                );

                if (res?.data?.success) {
                    const payload = res?.data?.data as RfidCardListResponse;

                    setListCards(payload?.data || []);
                    setPageCount(payload?.meta?.totalPages || 0);
                } else {
                    setListCards([]);
                    setPageCount(0);
                    toast.error(res?.data?.message || "Lấy danh sách thẻ thất bại");
                }
            } catch {
                setListCards([]);
                setPageCount(0);
                toast.error("Lỗi khi tải danh sách thẻ");
            }
        },
        [keyword, selectedStatus]
    );

    useEffect(() => {
        const loadInitial = async () => {
            await loadSummary();
        };
        loadInitial();
    }, []);

    useEffect(() => {
        const loadInit = async () => {
            setCurrentPage(1);
            await fetchCards(1, keyword, selectedStatus);
        };
        loadInit();
    }, [keyword, selectedStatus, fetchCards]);

    const handleSearchSubmit = () => {
        setKeyword(searchTerm.trim());
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setKeyword("");
    };

    const handleChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchSubmit();
        }
    };

    const handleClickBtnView = (card: RfidCard) => {
        setDataUpdate(card);
        setShowView(true);
    };

    const handleClickBtnUpdate = (card: RfidCard) => {
        setDataUpdate(card);
        setShowUpdate(true);
    };

    const resetUpdateData = () => {
        setDataUpdate({} as RfidCard);
        setShowUpdate(false);
    };

    const statusLabelMap = useMemo<Map<string, string>>(() => {
        return new Map(CARD_STATUS_OPTIONS.map((option) => [option.value, option.label]));
    }, []);

    return (
        <div className="manage-card-container">
            <div className="header">
                <div>
                    <div className="title">Quản lý thẻ xe</div>
                    <div className="sub-title">Theo dõi và quản lý thẻ trong bãi</div>
                </div>

                <div className="actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm theo mã thẻ"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={onKeyDown}
                        />

                        {keyword && (
                            <button
                                className="search-clear-btn"
                                onClick={handleClearSearch}
                                aria-label="clear search"
                            >
                                <IoMdClose
                                    className="clear-icon"
                                    style={{
                                        color: "red",
                                        fontSize: "1.2rem",
                                        fontWeight: "600",
                                    }}
                                />
                            </button>
                        )}

                        <button
                            className="search-icon-btn"
                            onClick={handleSearchSubmit}
                            aria-label="search"
                        >
                            <FaSearch
                                className="search-icon"
                                style={{ color: "#636262ff" }}
                            />
                        </button>
                    </div>

                    <select
                        className="filter-select"
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                    >
                        {CARD_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button className="btn-create" onClick={() => setShowCreate(true)}>
                        <FaPlus /> Thêm thẻ mới
                    </button>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card summary-card--primary">
                    <p className="summary-title">Tổng số thẻ</p>
                    <p className="summary-value">{summary.total}</p>
                    <p className="summary-sub">Tất cả thẻ đã cấp</p>
                </div>

                <div className="summary-card summary-card--success">
                    <p className="summary-title">Đã đăng ký</p>
                    <p className="summary-value">{summary.registered}</p>
                    <p className="summary-sub">Thẻ đã đăng ký thông tin</p>
                </div>

                <div className="summary-card summary-card--warning">
                    <p className="summary-title">Chưa đăng ký</p>
                    <p className="summary-value">{summary.guest}</p>
                    <p className="summary-sub">Thẻ chưa có thông tin</p>
                </div>

                <div className="summary-card summary-card--violet">
                    <p className="summary-title">Đã kích hoạt</p>
                    <p className="summary-value">{summary.active}</p>
                    <p className="summary-sub">Thẻ đang sử dụng</p>
                </div>
            </div>

            <div className="cards-content">
                <div className="table-card-container fade-in">
                    <TableCardPaginate
                        listCards={listCards}
                        pageCount={pageCount}
                        currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        statusLabelMap={statusLabelMap}
                        setCurrentPage={setCurrentPage}
                        fetchCards={fetchCards}
                        handleClickBtnView={handleClickBtnView}
                        handleClickBtnUpdate={handleClickBtnUpdate}
                    />
                </div>

                <ModelCreateCard
                    show={showCreate}
                    setShow={setShowCreate}
                    statusOptions={CARD_STATUS_OPTIONS}
                    refreshList={async () => {
                        await Promise.all([
                            loadSummary(),
                            fetchCards(currentPage, keyword, selectedStatus),
                        ]);
                    }}
                />

                <ModelUpdateCard
                    show={showUpdate}
                    setShow={setShowUpdate}
                    dataUpdate={dataUpdate}
                    statusOptions={CARD_STATUS_OPTIONS}
                    refreshList={async () => {
                        await Promise.all([
                            loadSummary(),
                            fetchCards(currentPage, keyword, selectedStatus),
                        ]);
                    }}
                    resetUpdateData={resetUpdateData}
                />

                <ModelViewCard
                    show={showView}
                    setShow={setShowView}
                    dataView={dataUpdate}
                    statusLabelMap={statusLabelMap}
                />
            </div>
        </div>
    );
};

export default ManageCard;