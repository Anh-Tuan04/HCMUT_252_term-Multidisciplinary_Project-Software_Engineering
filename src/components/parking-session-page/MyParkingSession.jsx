import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyParkingSessions } from '../../services/parkingSessionService';
import { TableParkingSessionPaginate } from './TableParkingSessionPaginate';
import { ModelViewParkingSession } from './ModelViewParkingSession';

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function MyParkingSession() {
  const navigate = useNavigate();
  const PAGE_SIZE = 10;

  const [date, setDate] = useState(getToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [listSessions, setListSessions] = useState([]);
  const [dataView, setDataView] = useState(null);
  const [showModelView, setShowModelView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchParkingSessions = async (selectedDate = date, page = currentPage) => {
    setIsLoading(true);
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
        toast.error(res?.data?.message || 'Lấy danh sách phiên gửi xe thất bại');
      }
    } catch (error) {
      setListSessions([]);
      setPageCount(0);
      toast.error('Lỗi khi lấy danh sách phiên gửi xe');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitial = async () => {
      setIsLoading(true);
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
        }
      } catch (error) {
        if (ignore) return;
        setListSessions([]);
        setPageCount(0);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChangeDate = async (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setCurrentPage(1);
    await fetchParkingSessions(selectedDate, 1);
  };

  const handleClickBtnView = (session) => {
    setDataView(session);
    setShowModelView(true);
  };

  return (
    <div className="my-parking-session">
      <div className="session-header">
        <div className="header-top">
          <button
            className="btn btn-back"
            onClick={() => navigate('/map')}
            title="Quay lại"
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Phiên gửi xe của tôi</h2>
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="dateFilter">
              <FaCalendarAlt /> Chọn ngày
            </label>
            <input
              id="dateFilter"
              type="date"
              value={date}
              onChange={handleChangeDate}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="session-content">
        {isLoading ? (
          <div className="text-center py-5">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <TableParkingSessionPaginate
            listSessions={listSessions}
            pageCount={pageCount}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            selectedDate={date}
            setCurrentPage={setCurrentPage}
            fetchParkingSessions={fetchParkingSessions}
            handleClickBtnView={handleClickBtnView}
            isAdmin={false}
          />
        )}
      </div>

      <ModelViewParkingSession
        show={showModelView}
        setShow={setShowModelView}
        dataView={dataView || {}}
      />
    </div>
  );
}
