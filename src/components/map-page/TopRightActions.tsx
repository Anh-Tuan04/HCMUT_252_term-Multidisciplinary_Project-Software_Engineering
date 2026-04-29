interface TopRightActionsProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onOpenSettings: () => void;
}

export const TopRightActions = ({
  isAuthenticated,
  onLogin,
  onOpenSettings,
}: TopRightActionsProps) => {
  if (!isAuthenticated) {
    return (
      <div className="top-right-actions">
        <button
          type="button"
          className="corner-btn authentication-wrapper"
          aria-label="Xác thực"
          onClick={onLogin}
        >
          <div className="authentication-guide">
            <span className="authentication-note">
              Đăng nhập hoặc Đăng ký ở đây
            </span>
            <span className="hand-pointer">👉</span>
          </div>
          <span className="material-icons authentication-btn">login</span>
        </button>
      </div>
    );
  }

  return (
    <div className="top-right-actions">
      <button
        type="button"
        className="corner-btn open-settings auth-only"
        aria-label="Mở cài đặt"
        onClick={onOpenSettings}
      >
        <span className="material-icons setting-btn">settings</span>
      </button>
      <button
        type="button"
        className="corner-btn auth-only"
        aria-label="Bảng điều khiển"
      >
        <img
          className="dashboard-btn"
          src="/src/assets/MapPage/DashboardIcon.svg"
          alt="Dashboard"
        />
      </button>
      <button type="button" className="corner-btn auth-only" aria-label="Thẻ">
        <span className="material-icons card-btn">credit_card</span>
      </button>
    </div>
  );
};
