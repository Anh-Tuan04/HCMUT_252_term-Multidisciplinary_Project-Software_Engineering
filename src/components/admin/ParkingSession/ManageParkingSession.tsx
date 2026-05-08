import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import TableParkingSessionPaginate from "./TableParkingSessionPaginate";
import ModelViewParkingSession from "./ModelViewParkingSession";

import {
  getAllLot,
  getAllParkingSessions,
  getRevenueByDay,
  getRevenueByMonth,
} from "../../../services/apiServices";
import type { Lot, ParkingSession } from "../../../interfaces";

import "./ManageParkingSession.scss";

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} VNĐ`;

const ManageParkingSession = () => {
  const PAGE_SIZE = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState(false);
  const [date, setDate] = useState(getToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [listSessions, setListSessions] = useState<ParkingSession[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [dataView, setDataView] = useState<ParkingSession>({} as ParkingSession);
  const [showModelView, setShowModelView] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [currentRevenueDay, setCurrentRevenueDay] = useState(0);
  const [currentRevenueMonth, setCurrentRevenueMonth] = useState(0);
  const [loadingLots, setLoadingLots] = useState(false);
  const didInitDateEffect = useRef(false);

  const resetSessionState = () => {
    setListSessions([]);
    setPageCount(0);
    setCurrentRevenueDay(0);
    setCurrentRevenueMonth(0);
    setCurrentPage(1);
  };

  const fetchParkingSessions = async (
    selectedDate = date,
    page = currentPage,
    keyword = searchTerm
  ) => {
    try {
      const res = await getAllParkingSessions(
        selectedDate,
        page,
        PAGE_SIZE,
        keyword,
        selectedLotId ?? undefined
      );

      if (res?.data?.success) {
        const payload = res.data.data;
        const sessions = payload?.data || payload || [];
        const meta = payload?.meta;

        setListSessions(sessions);
        setPageCount(meta?.totalPages || Math.ceil((payload?.total || 0) / PAGE_SIZE));
      } else {
        setListSessions([]);
        setPageCount(0);
        toast.error(res?.data?.message || "Lấy danh sách phiên gửi xe thất bại");
      }
    } catch {
      setListSessions([]);
      setPageCount(0);
      toast.error("Lỗi khi lấy danh sách phiên gửi xe");
    }
  };

  // Rút gọn useEffect giống ManageUser
  const fetchCurrentRevenue = async (lotId: number) => {
    try {
      const [dayRes, monthRes] = await Promise.all([
        getRevenueByDay(lotId, date),
        getRevenueByMonth(lotId, date),
      ]);

      setCurrentRevenueDay(dayRes?.data?.data?.revenue || 0);
      setCurrentRevenueMonth(monthRes?.data?.data?.revenue || 0);
    } catch {
      setCurrentRevenueDay(0);
      setCurrentRevenueMonth(0);
      toast.error("Lỗi khi lấy doanh thu hiện tại");
    } finally {
      // setLoadingRevenue(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingLots(true);
        const lotRes = await getAllLot();
        if (lotRes?.data?.success) {
          const lotList = lotRes?.data?.data || [];
          if (Array.isArray(lotList) && lotList.length > 0) {
            setLots(lotList);
            setSelectedLotId(lotList[0].id);
          } else {
            setLots([]);
            setSelectedLotId(null);
            resetSessionState();
          }
        } else {
          setLots([]);
          setSelectedLotId(null);
          resetSessionState();
        }
      } catch {
        setLots([]);
        setSelectedLotId(null);
        resetSessionState();
      } finally {
        setLoadingLots(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedLotId) {
      return;
    }

    const fetchData = async () => {
      setCurrentPage(1);
      await fetchParkingSessions(date, 1, search ? searchTerm : "");
      await fetchCurrentRevenue(selectedLotId);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLotId]);

  useEffect(() => {
    if (!didInitDateEffect.current) {
      didInitDateEffect.current = true;
      return;
    }

    const fetchDataByDate = async () => {
      if (!selectedLotId) return;
      await fetchParkingSessions(date, 1, search ? searchTerm : "");
      await fetchCurrentRevenue(selectedLotId);
    };

    fetchDataByDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleClearSearch = async () => {
    setCurrentPage(1);
    setSearchTerm("");
    setSearch(false);
    await fetchParkingSessions(date, 1, "");
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
    setSearch(true);
    setCurrentPage(1);
    await fetchParkingSessions(date, 1, searchTerm);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;

    setDate(selectedDate);
    setCurrentPage(1);
  };

  const handleChangeLot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedLotId(null);
      resetSessionState();
      return;
    }
    setSelectedLotId(Number(value));
  };

  const handleClickBtnView = (session: ParkingSession) => {
    setDataView(session);
    setShowModelView(true);
  };

  return (
    <div className="manage-parking-session-container">
      <div className="header">
        <div>
          <div className="title">Lịch sử gửi xe</div>
          <div className="sub-title">Xem danh sách phiên gửi xe theo ngày</div>
        </div>

        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Nhập biển số, mã thẻ..."
              value={searchTerm}
              onChange={handleChangeSearch}
              onKeyDown={onKeyDown}
            />
            {search ? (
              <button
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="clear search"
              >
                <IoMdClose
                  className="clear-icon"
                  style={{ color: "red", fontSize: "1.2rem", fontWeight: "600" }}
                />
              </button>
            ) : (
              <button
                className="search-icon-btn"
                onClick={handleSearchSubmit}
                aria-label="search"
              >
                <FaSearch className="search-icon" style={{ color: "#636262ff" }} />
              </button>
            )}
          </div>
          <div className="date-filter">
            <FaCalendarAlt className="date-icon" />
            <input type="date" value={date} onChange={handleChangeDate} />
          </div>
          <div className="lot-filter">
            <label htmlFor="parking-session-lot-select">Lot</label>
            <select
              id="parking-session-lot-select"
              value={selectedLotId ?? ""}
              onChange={handleChangeLot}
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
        </div>
      </div>

      <div className="revenue-summary">
        <div className="revenue-card">
          <div className="revenue-label">Doanh thu hôm nay</div>
          <div className="revenue-value">
            {formatMoney(currentRevenueDay)}
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-label">Doanh thu tháng này</div>
          <div className="revenue-value">
            {formatMoney(currentRevenueMonth)}
          </div>
        </div>
      </div>

      <div className="parking-session-content">
        <div className="table-parking-session-container fade-in">
          <TableParkingSessionPaginate
            listSessions={listSessions}
            pageCount={pageCount}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            setCurrentPage={setCurrentPage}
            fetchParkingSessions={fetchParkingSessions}
            selectedDate={date}
            handleClickBtnView={handleClickBtnView}
          />
        </div>

        <ModelViewParkingSession
          show={showModelView}
          setShow={setShowModelView}
          dataView={dataView}
        />
      </div>
    </div>
  );
};

export default ManageParkingSession;
