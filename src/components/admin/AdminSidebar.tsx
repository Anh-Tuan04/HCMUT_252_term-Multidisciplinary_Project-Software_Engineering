import { NavLink } from 'react-router-dom';
import { FaHome, FaCar, FaUserFriends, FaIdCard } from "react-icons/fa";
import { BsBuildingCheck, BsCalendar2CheckFill } from "react-icons/bs";
import { ImProfile } from "react-icons/im";
const AdminSidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile }
  : { collapsed?: boolean; mobileOpen?: boolean; onCloseMobile: () => void }) => {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">Admin</div>
        <button className="mobile-close" onClick={onCloseMobile} aria-label="Close menu">✕</button>
      </div>

      <nav className="nav">
        <NavLink to="/admin" end className="nav-item">
          <span className="icon"><ImProfile style={{ color: '#1ea971', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">DashBoard</span>}
        </NavLink>
        <NavLink to="/admin/parking_sessions" className="nav-item">
          <span className="icon"><BsBuildingCheck style={{ color: '#bebebeff'}} /></span>
          {!collapsed && <span className="label">Phiên đỗ xe</span>}
        </NavLink>
        <NavLink to="/admin/users" className="nav-item">
          <span className="icon"><FaUserFriends style={{ color: '#c5470d' }} /></span>
          {!collapsed && <span className="label">Quản lý người dùng</span>}
        </NavLink>
        <NavLink to="/admin/cards" className="nav-item">
          <span className="icon"><FaIdCard style={{ color: '#3b82f6' }} /></span>
          {!collapsed && <span className="label">Quản lý thẻ xe</span>}
        </NavLink>
        <NavLink to="/admin/parking_areas" className="nav-item">
          <span className="icon"><BsCalendar2CheckFill style={{ color: '#1be009' }} /></span>
          {!collapsed && <span className="label">Quản lý bãi đỗ</span>}
        </NavLink>
        <NavLink to="/parking-status" className="nav-item">
          <span className="icon"><FaCar style={{ color: 'purple', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">Trạng thái bãi đỗ</span>}
        </NavLink>
        <NavLink to="/" end className="nav-item">
          <span className="icon"><FaHome style={{ color: '#b1d960ff' }} /></span>
          {!collapsed && <span className="label">Trang chủ</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
