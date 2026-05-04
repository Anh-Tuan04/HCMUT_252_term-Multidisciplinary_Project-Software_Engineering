import { useEffect, useState } from "react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import TableParkingSessionPaginate from "./TableParkingSessionPaginate";
import ModelViewParkingSession from "./ModelViewParkingSession";

import { getAllParkingSessions } from "../../../services/apiServices";
import type { ParkingSession } from "../../../interfaces";

import "./ManageParkingSession.scss";

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ManageParkingSession = () => {
  const PAGE_SIZE = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState(false);
  const [date, setDate] = useState(getToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [listSessions, setListSessions] = useState<ParkingSession[]>([]);
  const [dataView, setDataView] = useState<ParkingSession>({} as ParkingSession);
  const [showModelView, setShowModelView] = useState(false);

  const fetchParkingSessions = async (
    selectedDate = date,
    page = currentPage,
    keyword = searchTerm
  ) => {
    try {
      const res = await getAllParkingSessions(selectedDate, page, PAGE_SIZE, keyword);

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
  useEffect(() => {
    const loadInitialParkingSessions = async () => {
      await fetchParkingSessions(date, 1, "");
    };
    loadInitialParkingSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleChangeDate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;

    setDate(selectedDate);
    setCurrentPage(1);

    // Khi đổi ngày, vẫn giữ nguyên bộ lọc tìm kiếm hiện tại
    await fetchParkingSessions(selectedDate, 1, search ? searchTerm : "");
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