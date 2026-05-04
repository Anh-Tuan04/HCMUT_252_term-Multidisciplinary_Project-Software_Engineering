import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import TableParkingSessionPaginate from "./TableParkingSessionPaginate";
import ModelViewParkingSession from "./ModelViewParkingSession"

import { getMyParkingSessions } from "../../../services/apiServices";
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

  const [date, setDate] = useState(getToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [listSessions, setListSessions] = useState<ParkingSession[]>([]);
  const [dataView, setDataView] = useState<ParkingSession>({} as ParkingSession);
  const [showModelView, setShowModelView] = useState(false);

  const fetchParkingSessions = async (
    selectedDate = date,
    page = currentPage
  ) => {
    try {
      const res = await getMyParkingSessions(selectedDate, page, PAGE_SIZE);

      if (res?.data?.success) {
        const payload = res.data.data;

        const sessions = payload?.data || [];
        const meta = payload?.meta;

        setListSessions(sessions);
        setPageCount(meta?.totalPages || 0);
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

  useEffect(() => {
  let ignore = false;

  const loadInitialParkingSessions = async () => {
    try {
      const res = await getMyParkingSessions(date, 1, PAGE_SIZE);

      if (ignore) return;

      if (res?.data?.success) {
        const payload = res.data.data;

        const sessions = payload?.data || [];
        const meta = payload?.meta;

        setListSessions(sessions);
        setPageCount(meta?.totalPages || 0);
      } else {
        setListSessions([]);
        setPageCount(0);
        toast.error(res?.data?.message || "Lấy danh sách phiên gửi xe thất bại");
      }
    } catch {
      if (ignore) return;

      setListSessions([]);
      setPageCount(0);
      toast.error("Lỗi khi lấy danh sách phiên gửi xe");
    }
  };

  loadInitialParkingSessions();

  return () => {
    ignore = true;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleChangeDate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;

    setDate(selectedDate);
    setCurrentPage(1);

    await fetchParkingSessions(selectedDate, 1);
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