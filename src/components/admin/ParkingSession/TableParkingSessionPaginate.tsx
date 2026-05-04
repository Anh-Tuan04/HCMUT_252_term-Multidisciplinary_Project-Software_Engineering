import "bootstrap/dist/css/bootstrap.min.css";
import ReactPaginate from "react-paginate";
import {
  BsArrowRightCircleFill,
  BsFillCameraFill,
} from "react-icons/bs";

import type { ManageParkingSession } from "../../../interfaces"

type TableParkingSessionPaginateProps = {
  listSessions: ManageParkingSession[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  selectedDate: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  fetchParkingSessions: (date: string, page: number) => Promise<void> | void;
  handleClickBtnView: (session: ManageParkingSession) => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chưa có";

  return new Date(value).toLocaleString("vi-VN", {
    hour12: false,
  });
};

const ReactPaginateComponent =
  (ReactPaginate as unknown as { default?: typeof ReactPaginate }).default ??
  ReactPaginate;

const TableParkingSessionPaginate = (
  props: TableParkingSessionPaginateProps
) => {
  const {
    listSessions,
    pageCount,
    currentPage,
    pageSize,
    selectedDate,
    setCurrentPage,
    fetchParkingSessions,
    handleClickBtnView,
  } = props;

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1;

    setCurrentPage(newPage);
    fetchParkingSessions(selectedDate, newPage);
  };

  return (
    <div className="parking-session-table">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">STT</th>
            <th scope="col">Họ tên</th>
            <th scope="col">Biển số</th>
            <th scope="col">UID thẻ</th>
            <th scope="col">Thời gian vào</th>
            <th scope="col">Thời gian ra</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Action</th>
          </tr>
        </thead>

        <tbody>
          {listSessions && listSessions.length > 0 ? (
            listSessions.map((item, index) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{
                  item.owner_name?
                    item.owner_name
                  : "-----"
                }</td>
                <td>{item.plate_number}</td>
                <td>{item.card_uid}</td>
                <td>{formatDateTime(item.entry_time)}</td>
                <td>{
                  item.exit_time ?
                    formatDateTime(item.exit_time)
                  : "-----"
                }</td>
                <td>
                  {item.is_active ? (
                    <span className="status-badge status-active">
                      Đang gửi
                    </span>
                  ) : (
                    <span className="status-badge status-closed">
                      Đã kết thúc
                    </span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleClickBtnView(item)}
                  >
                    <BsFillCameraFill style={{ fontSize: "1.1rem" }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">
                Không có phiên gửi xe
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ReactPaginateComponent
        nextLabel={<BsArrowRightCircleFill style={{ fontSize: "1.5rem" }} />}
        previousLabel={
          <BsArrowRightCircleFill
            style={{ fontSize: "1.5rem", transform: "scaleX(-1)" }}
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
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
        forcePage={currentPage - 1}
      />
    </div>
  );
};

export default TableParkingSessionPaginate;