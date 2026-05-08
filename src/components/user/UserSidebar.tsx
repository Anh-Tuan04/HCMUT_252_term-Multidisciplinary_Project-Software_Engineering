import { NavLink } from 'react-router-dom';
import { FaHome, FaCar } from "react-icons/fa";
import { BsBuildingCheck } from "react-icons/bs";
import { ImProfile } from "react-icons/im";
import { MdOutlinePayment } from "react-icons/md";
const UserSidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile }
  : { collapsed?: boolean; mobileOpen?: boolean; onCloseMobile: () => void }) => {
  return (
    <aside className={`user-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">User</div>
        <button className="mobile-close" onClick={onCloseMobile} aria-label="Close menu">✕</button>
      </div>

      <nav className="nav">
        <NavLink to="/user" end className="nav-item">
          <span className="icon"><ImProfile style={{ color: '#1ea971', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">My Profile</span>}
        </NavLink>
        <NavLink to="/user/payments" end className="nav-item">
          <span className="icon"><MdOutlinePayment style={{ color: '#a8a500', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">My Payments</span>}
        </NavLink>
        <NavLink to="/user/parking_sessions" className="nav-item">
          <span className="icon"><BsBuildingCheck style={{ color: '#bebebeff'}} /></span>
          {!collapsed && <span className="label">Phiên đỗ xe</span>}
        </NavLink>
        <NavLink to="/parking-status" className="nav-item">
          <span className="icon"><FaCar style={{ color: 'purple', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">Trạng thái bãi đỗ</span>}
        </NavLink>
        <NavLink to="/" className="nav-item">
          <span className="icon"><FaHome style={{ color: '#b1d960ff' }} /></span>
          {!collapsed && <span className="label">Trang chủ</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default UserSidebar;
