import { useMemo } from 'react';

const formatDateTime = (value) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN', { hour12: false });
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return '0 VNĐ';
  return value.toLocaleString('vi-VN') + ' VNĐ';
};

export function ModelViewParkingSession({ show, setShow, dataView }) {
  const handleClose = () => {
    setShow(false);
  };

  const session = useMemo(
    () => ({
      id: dataView?.id || '',
      lotId: dataView?.lot_id || '',
      slotId: dataView?.slot_id || 'Chưa gán',
      cardUid: dataView?.card_uid || '',
      cardType: dataView?.card_type || '',
      plateNumber: dataView?.plate_number || '',
      entryTime: formatDateTime(dataView?.entry_time),
      exitTime: formatDateTime(dataView?.exit_time),
      fee: formatMoney(dataView?.fee),
      status: dataView?.is_active ? 'Đang gửi' : 'Đã kết thúc',
    }),
    [dataView]
  );

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">Chi tiết phiên gửi xe</h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="modal-body">
          <form className="parking-session-form">
            <div className="row-group">
              <div className="form-group">
                <label>Trạng thái</label>
                <input
                  className="form-control"
                  value={session.status}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Biển số xe</label>
                <input
                  className="form-control"
                  value={session.plateNumber}
                  disabled
                />
              </div>
            </div>

            <div className="row-group">
              <div className="form-group">
                <label>Bãi xe</label>
                <input className="form-control" value={session.lotId} disabled />
              </div>

              <div className="form-group">
                <label>Vị trí đỗ</label>
                <input
                  className="form-control"
                  value={session.slotId}
                  disabled
                />
              </div>
            </div>

            <div className="row-group">
              <div className="form-group">
                <label>UID thẻ</label>
                <input
                  className="form-control"
                  value={session.cardUid}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Loại thẻ</label>
                <input
                  className="form-control"
                  value={session.cardType}
                  disabled
                />
              </div>
            </div>

            <div className="row-group">
              <div className="form-group">
                <label>Thời gian vào</label>
                <input
                  className="form-control"
                  value={session.entryTime}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Thời gian ra</label>
                <input
                  className="form-control"
                  value={session.exitTime}
                  disabled
                />
              </div>
            </div>

            <div className="form-group full">
              <label>Phí gửi xe</label>
              <input className="form-control" value={session.fee} disabled />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
