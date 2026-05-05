import "bootstrap/dist/css/bootstrap.min.css";
import ReactPaginateMod from "react-paginate";
import { BsArrowRightCircleFill, BsFillCameraFill, BsFillPencilFill } from "react-icons/bs";
import type { RfidCard } from "../../../interfaces";

const ReactPaginate =
  (ReactPaginateMod as unknown as { default: typeof ReactPaginateMod }).default ||
  ReactPaginateMod;

type TableCardPaginateProps = {
  listCards: RfidCard[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  statusLabelMap: Map<string, string>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  fetchCards: (page: number) => Promise<void> | void;
  handleClickBtnView: (card: RfidCard) => void;
  handleClickBtnUpdate: (card: RfidCard) => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", { hour12: false });
};

const getStatusLabel = (status: string | null | undefined, map: Map<string, string>) => {
  if (!status) return "—";
  return map.get(status) || status;
};

const TableCardPaginate = (props: TableCardPaginateProps) => {
  const {
    listCards,
    pageCount,
    currentPage,
    pageSize,
    statusLabelMap,
    setCurrentPage,
    fetchCards,
    handleClickBtnView,
    handleClickBtnUpdate,
  } = props;

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
    fetchCards(newPage);
  };

  return (
    <div className="card-table">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">STT</th>
            <th scope="col">Mã thẻ</th>
            <th scope="col">Tên user</th>
            <th scope="col">Loại thẻ</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Ngày đăng ký</th>
            <th scope="col">Action</th>
          </tr>
        </thead>

        <tbody>
          {listCards && listCards.length > 0 ? (
            listCards.map((item, index) => (
              <tr key={item.id ?? index}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{item.cardUid}</td>
                <td>{item.ownerName || "—"}</td>
                <td>
                  <span className={`status-pill status-pill--${item.status?.toLowerCase() || "default"}`}>
                    {getStatusLabel(item.status, statusLabelMap)}
                  </span>
                </td>
                <td>
                  {item.isActive ? (
                    <span className="status-active">Đã kích hoạt</span>
                  ) : (
                    <span className="status-inactive">Không hoạt động</span>
                  )}
                </td>
                <td>{formatDateTime(item.registeredAt)}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleClickBtnView(item)}>
                    <BsFillCameraFill style={{ fontSize: "1.1rem" }} />
                  </button>
                  <button className="btn btn-warning mx-3" onClick={() => handleClickBtnUpdate(item)}>
                    <BsFillPencilFill style={{ fontSize: "1.1rem" }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">
                Không có thẻ
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pageCount > 0 && (
        <ReactPaginate
          nextLabel={<BsArrowRightCircleFill style={{ fontSize: "1.5rem" }} />}
          previousLabel={
            <BsArrowRightCircleFill style={{ fontSize: "1.5rem", transform: "scaleX(-1)" }} />
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
      )}
    </div>
  );
};

export default TableCardPaginate;