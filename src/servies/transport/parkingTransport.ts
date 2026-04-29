export type TransportConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "unsupported";

export type MessageListener = (payload: unknown) => void;
export type StateListener = (state: TransportConnectionState, detail?: string) => void;

export interface ParkingTransportClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  onMessage(listener: MessageListener): () => void;
  onStateChange(listener: StateListener): () => void;
}
