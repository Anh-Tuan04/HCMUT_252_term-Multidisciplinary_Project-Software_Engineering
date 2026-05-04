import { useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './CreateView.scss';
import type { UserProfile } from '../../../interfaces';
type ModelViewUserProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  dataUpdate: UserProfile;
};
const ModelViewUser = (props: ModelViewUserProps) => {
  const { show, setShow, dataUpdate } = props;
  const handleClose = () => {
    setShow(false);
  };

  const { email, first_name, last_name, role } = useMemo(
    () => ({
      email: dataUpdate?.email || "",
      first_name: dataUpdate?.first_name || "",
      last_name: dataUpdate?.last_name || "",
      role: dataUpdate?.role || "USER",
    }),
    [dataUpdate]
  );

  return (
    <Modal show={show} onHide={handleClose}
  backdrop="static" className="model-user">
      <Modal.Header closeButton>
        <Modal.Title>View User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="user-form">
  <div className="form-group full">
    <label>Email</label>
    <input type="email" className="form-control" value={email} disabled />
  </div>

  <div className="row-group">
    <div className="form-group">
      <label>First Name</label>
      <input type="text" className="form-control" value={first_name} disabled />
    </div>
    <div className="form-group">
      <label>Last Name</label>
      <input type="text" className="form-control" value={last_name} disabled />
    </div>
    <div className="form-group">
      <label>Role</label>
      <select className="form-select" value={role} disabled>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
  </div>
</form>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelViewUser;