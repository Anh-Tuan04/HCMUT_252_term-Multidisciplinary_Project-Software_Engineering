import ReactPaginate from 'react-paginate';
import { BsArrowRightCircleFill, BsFillCameraFill } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';

const formatDateTime = (value) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN', { hour12: false });
};

export function TableParkingSessionPaginate({
  listSessions,
  pageCount,
  currentPage,
  pageSize,
  selectedDate,
  setCurrentPage,
  fetchParkingSessions,
  handleClickBtnView,
  isAdmin = false,
}) {
  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
    fetchParkingSessions(selectedDate, newPage);
  };

  const getFullName = (firstName, lastName) => {
    const first = firstName || '';
    const last = lastName || '';
    return (first + ' ' + last).trim() || '---';
  };

  return (
    <div className="parking-session-table">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">STT</th>
            {isAdmin && <th scope="col">Họ tên</th>}
            <th scope="col">Biển số</th>
            <th scope="col">UID thẻ</th>
            <th scope="col">Thời gian vào</th>
            <th scope="col">Thời gian ra</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {listSessions && listSessions.length > 0 ? (
            listSessions.map((item, index) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                {isAdmin && (
                  <td>{getFullName(item.user?.first_name, item.user?.last_name)}</td>
                )}
                <td>{item.plate_number || '---'}</td>
                <td>{item.card_uid || '---'}</td>
                <td>{formatDateTime(item.entry_time)}</td>
                <td>{item.exit_time ? formatDateTime(item.exit_time) : '---'}</td>
                <td>
                  {item.is_active ? (
                    <span className="status-badge status-active">Đang gửi</span>
                  ) : (
                    <span className="status-badge status-closed">Đã kết thúc</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleClickBtnView(item)}
                    title="Xem chi tiết"
                  >
                    <BsFillCameraFill style={{ fontSize: '1rem' }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 8 : 7} className="text-center text-muted py-4">
                Không có phiên gửi xe
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pageCount > 1 && (
        <ReactPaginate
          nextLabel={<BsArrowRightCircleFill style={{ fontSize: '1.2rem' }} />}
          previousLabel={
            <BsArrowRightCircleFill
              style={{ fontSize: '1.2rem', transform: 'scaleX(-1)' }}
            />
          }
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination justify-content-center mt-4"
          activeClassName="active"
          renderOnZeroPageCount={null}
          forcePage={currentPage - 1}
        />
      )}
    </div>
  );
}
