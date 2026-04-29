import type { TransportConnectionState } from "../../servies/transport/parkingTransport";

interface ConnectionStatusProps {
  state: TransportConnectionState;
  detail?: string;
  endpoint: string;
}

const STATE_LABEL: Record<TransportConnectionState, string> = {
  idle: "Chưa kết nối",
  connecting: "Đang kết nối",
  connected: "Đã kết nối",
  disconnected: "Đã ngắt kết nối",
  error: "Lỗi kết nối",
  unsupported: "Trình duyệt không hỗ trợ",
};

export const ConnectionStatus = ({
  state,
  detail,
  endpoint,
}: ConnectionStatusProps) => {
  return (
    <div className="connection-status" aria-live="polite">
      <span className={`connection-dot connection-${state}`} />
      <span className="connection-text">Realtime: {STATE_LABEL[state]}</span>
      <span className="connection-endpoint">{endpoint}</span>
      {detail ? <span className="connection-detail">{detail}</span> : null}
    </div>
  );
};
