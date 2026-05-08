import { useNavigate } from 'react-router-dom';
import './DepositSuccess.scss';

const DepositSuccess = () => {
    const navigate = useNavigate();

    const handleGoWallet = () => {
        navigate('/user/payments');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="deposit-success-page">
            <div className="deposit-success-card">
                <div className="success-icon-wrapper">
                    <div className="success-icon">
                        <span>✓</span>
                    </div>
                </div>

                <h1>Thanh toán đã được xử lý</h1>

                <p className="description">
                    Giao dịch nạp tiền của bạn đã được PayOS xử lý.
                    Hệ thống sẽ cập nhật số dư ví sau khi nhận xác nhận từ webhook.
                </p>

                <div className="notice-box">
                    <p>
                        Nếu số dư chưa cập nhật ngay, vui lòng chờ vài giây rồi kiểm tra lại
                        lịch sử giao dịch trong ví.
                    </p>
                </div>

                <div className="action-group">
                    <button className="primary-btn" onClick={handleGoWallet}>
                        Về ví của tôi
                    </button>

                    <button className="secondary-btn" onClick={handleGoHome}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositSuccess;