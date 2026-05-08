import { useNavigate } from 'react-router-dom';
import './DepositCancel.scss';

const DepositCancel = () => {
    const navigate = useNavigate();

    const handleRetryDeposit = () => {
        navigate('/user/payments');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="deposit-cancel-page">
            <div className="deposit-cancel-card">
                <div className="cancel-icon-wrapper">
                    <div className="cancel-icon">
                        <span>!</span>
                    </div>
                </div>

                <h1>Thanh toán đã bị hủy</h1>

                <p className="description">
                    Bạn đã hủy giao dịch nạp tiền hoặc giao dịch chưa được hoàn tất.
                    Số dư ví của bạn sẽ không thay đổi.
                </p>

                <div className="notice-box">
                    <p>
                        Bạn có thể quay lại ví để tạo giao dịch nạp tiền mới bất cứ lúc nào.
                    </p>
                </div>

                <div className="action-group">
                    <button className="primary-btn" onClick={handleRetryDeposit}>
                        Quay lại ví
                    </button>

                    <button className="secondary-btn" onClick={handleGoHome}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositCancel;