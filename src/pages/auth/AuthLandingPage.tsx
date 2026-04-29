interface AuthLandingPageProps {
  navigate: (path: string) => void;
}

export const AuthLandingPage = ({ navigate }: AuthLandingPageProps) => {
  return (
    <div className="auth-page auth-home-page">
      <div className="auth-top-actions">
        <button
          type="button"
          className="auth-map-btn"
          onClick={() => navigate("/map")}
        >
          Back to map
        </button>
      </div>
      <div className="page-wrapper">
        <main className="hero-card">
          <p className="badge">Smart Parking Platform</p>
          <h1 className="main-title">
            Chào mừng đến với Smart Parking website
          </h1>
          <p className="main-subtitle">
            Hệ thống quản lý bãi xe trực quan, nhanh gọn và tối ưu trải nghiệm
            cho bạn.
          </p>

          <div className="action-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/auth/login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/auth/signup")}
            >
              Đăng ký
            </button>
          </div>

          <p className="signup-text">
            Bạn chưa có tài khoản? Đăng ký ngay để bắt đầu.
          </p>
        </main>
      </div>
    </div>
  );
};
