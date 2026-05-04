import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginateMod from "react-paginate";
import { BsFillPencilFill, BsFillCameraFill, BsArrowRightCircleFill } from "react-icons/bs";

import type { UserProfile } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPaginate = (ReactPaginateMod as unknown as { default: React.ComponentType<any> }).default || ReactPaginateMod;

type TableUserPaginateProps = {
  listUsers: UserProfile[];
  pageCount: number;
  currentPage: number;
  limit: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  fetchListUsersWithPaginate: (page: number, keyword?: string) => Promise<void> | void;
  handleClickBtnView: (user: UserProfile) => void;
  handleClickBtnUpdate: (user: UserProfile) => void;
  resetSearchTerm: () => void;
};

const TableUserPaginate = (props: TableUserPaginateProps) => {
  const { listUsers, pageCount} = props;

  const handlePageClick = (event: { selected: number }) => {
    const newPage = +event.selected + 1;

    const newSearchTerm = "";

    props.setCurrentPage(newPage);
    props.fetchListUsersWithPaginate(newPage, newSearchTerm);

    props.resetSearchTerm();
  };

  return (
    <div className="user-table">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {listUsers && listUsers.length > 0 ? (
            listUsers.map((item, index) => (
              <tr key={index}>
                <td>{(props.currentPage - 1) * props.limit + index + 1}</td>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => props.handleClickBtnView(item)}
                  >
                    <BsFillCameraFill style={{ fontSize: '1.1rem' }} />
                  </button>
                  <button
                    className="btn btn-warning mx-3"
                    onClick={() => props.handleClickBtnUpdate(item)}
                  >
                    <BsFillPencilFill style={{ fontSize: '1.1rem' }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">Not found</td>
            </tr>
          )}
        </tbody>
      </table>

      {pageCount > 0 && (
        <ReactPaginate
          nextLabel={<BsArrowRightCircleFill style={{ fontSize: '1.5rem' }} />}
          previousLabel={<BsArrowRightCircleFill style={{ fontSize: '1.5rem', transform: 'scaleX(-1)' }} />}
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
          forcePage={props.currentPage - 1}
        />
      )}
    </div>
  );
};

export default TableUserPaginate;