import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import {
  FaParking,
  FaArrowRight,
  FaCar,
  FaChartBar,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaBolt,
} from 'react-icons/fa';
import { MdSensors, MdQrCodeScanner } from 'react-icons/md';
import './WelcomePage.scss';

type QuickAction = {
  to: string;
  label: string;
  type: 'primary' | 'secondary';
};

const features = [
  {
    icon: <MdSensors size={24} />,
    title: 'Giám sát thời gian thực',
    desc: 'Hệ thống cảm biến IoT cập nhật trạng thái từng chỗ đỗ liên tục 24/7, không bỏ sót bất kỳ thay đổi nào.',
  },
  {
    icon: <FaMapMarkerAlt size={22} />,
    title: 'Bản đồ bãi đỗ trực quan',
    desc: 'Xem sơ đồ bãi đỗ dạng lưới, phân biệt rõ chỗ trống, đã đặt và đang sử dụng chỉ qua màu sắc.',
  },
  {
    icon: <MdQrCodeScanner size={24} />,
    title: 'Vào ra bằng Biển số',
    desc: 'Tự động nhận diện xe camera AI, không cần thao tác thủ công, giảm ùn tắc cổng vào.',
  },
  {
    icon: <FaChartBar size={22} />,
    title: 'Báo cáo & Thống kê',
    desc: 'Dashboard quản trị với biểu đồ doanh thu, lưu lượng xe theo giờ, ngày.',
  },
  {
    icon: <FaMobileAlt size={22} />,
    title: 'Đặt chỗ trước online',
    desc: 'Người dùng đặt trước qua web hoặc app, nhận xác nhận tức thì và thanh toán không tiền mặt.',
  },
  {
    icon: <FaShieldAlt size={22} />,
    title: 'Bảo mật & Phân quyền',
    desc: 'Hệ thống phân quyền Admin / Khách hàng độc lập, nhật ký hoạt động đầy đủ.',
  },
];

const stats = [
  { value: '500+', label: 'Chỗ đỗ xe được quản lý', icon: <FaParking /> },
  { value: '10K+', label: 'Lượt xe mỗi ngày', icon: <FaCar /> },
  { value: '99.9%', label: 'Uptime hệ thống', icon: <FaBolt /> },
  { value: '<3s', label: 'Thời gian phản hồi', icon: <MdSensors /> },
];

const WelcomePage = () => {
  const { isAuthenticated, account } = useAppSelector((state) => state.user);
  const role = (account?.role || '').toUpperCase();
  const isAdmin = isAuthenticated && role === 'ADMIN';

  const quickActions: QuickAction[] = !isAuthenticated
  ? [
      { to: '/login', label: 'Đăng nhập', type: 'secondary' },
      { to: '/register', label: 'Đăng ký', type: 'primary' },
    ]
  : [
      { to: '/parking-status', label: 'Trạng thái bãi đỗ', type: 'secondary' },
      { to: '/user', label: 'Trang cá nhân', type: isAdmin ? 'secondary' : 'primary' },
      ...(isAdmin
        ? [
            {
              to: '/admin',
              label: 'Quản trị hệ thống',
              type: 'primary',
            } as QuickAction,
          ]
        : []),
    ];

  return (
    <div className="welcome-page">
      {/* ── HEADER ── */}
      <header className="welcome-header">
        <div className="brand">
          <FaParking className="brand-icon" />
          <span>Smart Parking</span>
        </div>
        <nav className="actions">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className={`action-btn ${a.type}`}>
              {a.label}
              {a.type === 'primary' && <FaArrowRight className="btn-icon" />}
            </Link>
          ))}
        </nav>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="hero-section">
          <div className="hero-text">
            <span className="hero-badge">🚀 Giải pháp đỗ xe thế hệ mới</span>
            <h1>
              Quản lý bãi đỗ xe <br />
              <span className="gradient-text">thông minh & hiện đại</span>
            </h1>
            <p>
              Smart Parking giúp bạn theo dõi, vận hành và tối ưu toàn bộ bãi đỗ
              xe trên một nền tảng duy nhất — từ cảm biến IoT đến báo cáo doanh
              thu, tất cả trong tầm tay.
            </p>
          </div>

          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=700&q=80"
              alt="Bãi đỗ xe hiện đại"
              className="hero-image"
            />
            <div className="hero-image-badge">
              <FaBolt className="hib-icon" />
              <div>
                <strong>Live</strong>
                <span>Dữ liệu thời gian thực</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── FEATURES ── */}
        <section className="features-section">
          <div className="section-label">Tính năng nổi bật</div>
          <h2 className="section-title">
            Mọi thứ cần thiết để vận hành bãi đỗ xe chuyên nghiệp
          </h2>
          <p className="section-desc">
            Từ cảm biến phần cứng đến phần mềm quản lý — Smart Parking bao phủ
            toàn bộ quy trình vận hành.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="cta-section">
          <img
            src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&q=80"
            alt="Smart parking lot"
            className="cta-bg"
          />
          <div className="cta-overlay" />
          <div className="cta-content">
            <h2>Sẵn sàng trải nghiệm dịch vụ đỗ xe hiện đại?</h2>
            <p>
              Tham gia để nhận được những ưu đãi độc quyền và trải nghiệm đỗ xe thông minh nhất.
            </p>
          </div>
        </section>
      </main>


      <footer className="welcome-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaParking />
              <span>Smart Parking</span>
            </div>
            <p>Giải pháp số hóa bãi đỗ xe thông minh - vận hành hiệu quả, quản lý dễ dàng.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Sản phẩm</h4>
              <ul>
                <li><Link to="/parking-status">Trang thái bãi đỗ</Link></li>
                <li><Link to="/register">Đăng ký</Link></li>
                <li><Link to="/login">Đăng nhập</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Tính năng</h4>
              <ul>
                <li><span>Giám sát thời gian thực</span></li>
                <li><span>Đặt chỗ trước online</span></li>
                <li><span>Báo cáo &amp; thống kê</span></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Liên hệ</h4>
              <ul>
                <li><span>support@smartparking.vn</span></li>
                <li><span>1800 123 456</span></li>
                <li><span>TP. Hồ Chí Minh, Việt Nam</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&#169; 2026 Smart Parking System. All rights reserved.</span>
          <div className="footer-bottom-links">
            <span>Chính sách bảo mật</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;