import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { getAllParkingSessions } from '../../services/parkingSessionService';
import { TableParkingSessionPaginate } from './TableParkingSessionPaginate';
import { ModelViewParkingSession } from './ModelViewParkingSession';

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AdminParkingSession() {
  const navigate = useNavigate();
  const PAGE_SIZE = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState(false);
  const [date, setDate] = useState(getToday());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [listSessions, setListSessions] = useState([]);
  const [dataView, setDataView] = useState(null);
  const [showModelView, setShowModelView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchParkingSessions = async (
    selectedDate = date,
    page = currentPage,
    keyword = searchTerm
  ) => {
    setIsLoading(true);
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
        const res = await getAllParkingSessions(date, 1, PAGE_SIZE, '');

        if (ignore) return;

        if (res?.data?.success) {
          const payload = res.data.data;
          const sessions = payload?.data || payload || [];
          const meta = payload?.meta;

          setListSessions(sessions);
          setPageCount(meta?.totalPages || Math.ceil((payload?.total || 0) / PAGE_SIZE));
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

  const handleClearSearch = async () => {
    setCurrentPage(1);
    setSearchTerm('');
    setSearch(false);
    await fetchParkingSessions(date, 1, '');
  };

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
    setSearch(true);
    setCurrentPage(1);
    await fetchParkingSessions(date, 1, searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleChangeDate = async (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setCurrentPage(1);

    if (search) {
      await fetchParkingSessions(selectedDate, 1, searchTerm);
    } else {
      await fetchParkingSessions(selectedDate, 1, '');
    }
  };

  const handleClickBtnView = (session) => {
    setDataView(session);
    setShowModelView(true);
  };

  return (
    <div className="admin-parking-session">
      <div className="session-header">
        <div className="header-top">
          <button
            className="btn btn-back"
            onClick={() => navigate('/map')}
            title="Quay lại"
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Quản lý phiên gửi xe</h2>
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

          <div className="filter-item search-item">
            <label htmlFor="searchInput">
              <FaSearch /> Tìm kiếm
            </label>
            <div className="search-container">
              <input
                id="searchInput"
                type="text"
                placeholder="Biển số, UID thẻ..."
                value={searchTerm}
                onChange={handleChangeSearch}
                onKeyDown={handleKeyDown}
                className="form-control"
              />
              {search && searchTerm && (
                <button
                  className="btn btn-close-search"
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm"
                >
                  <IoMdClose />
                </button>
              )}
              <button
                className="btn btn-search"
                onClick={handleSearchSubmit}
                title="Tìm kiếm"
              >
                <FaSearch />
              </button>
            </div>
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
            isAdmin={true}
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
