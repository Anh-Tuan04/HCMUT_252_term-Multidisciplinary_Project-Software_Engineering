import type {
  MessageListener,
  ParkingTransportClient,
  StateListener,
  TransportConnectionState,
} from "./parkingTransport";

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error && value.message) {
    return value.message;
  }
  return "Không thể kết nối WebTransport";
};

export class WebTransportParkingClient implements ParkingTransportClient {
  private transport: any = null;

  private connectPromise: Promise<void> | null = null;

  private readerAbortController: AbortController | null = null;

  private disconnecting = false;

  private readonly messageListeners = new Set<MessageListener>();

  private readonly stateListeners = new Set<StateListener>();

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    // console.log("%c>>> CONNECT METHOD CALLED <<<", "background: #222; color: #bada55; font-size: 16px;");
    if (this.connectPromise) return this.connectPromise;
    if (this.transport) return;

    if (typeof window === "undefined" || !("WebTransport" in window)) {
      this.emitState("unsupported", "Trình duyệt không hỗ trợ WebTransport");
      return;
    }
    this.emitState("connecting");

    const WebTransportCtor = (window as any).WebTransport;

    this.connectPromise = (async () => {

    // // --- BẮT ĐẦU ĐOẠN SỬA ---
    // // 1. Khai báo mã hash bạn đã lấy được từ lệnh Go/OpenSSL
    // const certHashBase64 = "Wo/MzR7v+umrxN17BxNavSteWjDD3uzkl7ZPXubhKfA=";
    
    // // 2. Chuyển đổi Base64 sang Uint8Array
    // const hashArray = Uint8Array.from(atob(certHashBase64), (c) => c.charCodeAt(0));

    // // 3. Cấu hình options để trình duyệt chấp nhận chứng chỉ tự ký (localhost)
    // const options = {
    //   serverCertificateHashes: [
    //     {
    //       algorithm: "sha-256",
    //       value: hashArray,
    //     },
    //   ],
    // };
    // // 4. Truyền options vào constructor
    // const transport = new WebTransportCtor(this.url, options);
    // // --- KẾT THÚC ĐOẠN SỬA ---  

      const transport = new WebTransportCtor(this.url);
      this.transport = transport;
      this.disconnecting = false;
      this.readerAbortController = new AbortController();

      transport.closed
        .then(() => {
          if (!this.disconnecting) {
            // console.warn("WebTransport connection closed unexpectedly");
            this.emitState("disconnected");
          }
          console.log("WebTransport connection closed ok");
        })
        .catch((error: unknown) => {
          if (!this.disconnecting) {
            // console.error("WebTransport connection closed with error:", error);
            console.log("transport.closed error:");
            console.dir(error);
            this.emitState("error", toErrorMessage(error));
          }
          console.log("transport.closed error:");
          console.dir(error);
        });

      await transport.ready;
      this.emitState("connected");

      const signal = this.readerAbortController.signal;
      void this.consumeBidirectionalStreams(transport, signal);
      void this.consumeUnidirectionalStreams(transport, signal);
    })()
      .catch((error: any) => {
  // Lỗi xảy ra ngay khi khởi tạo hoặc trong quá trình await ready
        console.log("connectPromise error:");
        console.dir(error);
        console.log("name:", error?.name);
        console.log("message:", error?.message);
        this.transport = null;
        this.emitState("error", toErrorMessage(error));
        throw error;
      })
      .finally(() => {
        this.connectPromise = null;
      });

    return this.connectPromise;
  }

  async disconnect(): Promise<void> {
    this.disconnecting = true;

    if (this.readerAbortController) {
      this.readerAbortController.abort();
      this.readerAbortController = null;
    }

    // Đợi connect hoàn tất trước khi ngắt kết nối
    if (this.connectPromise) {
      await this.connectPromise.catch(() => undefined); // Bỏ qua lỗi nếu connect thất bại
    }

    const activeTransport = this.transport;
    this.transport = null;

    if (activeTransport?.close) {
      try {
        activeTransport.close();
      } catch {
        // Ignore close errors because disconnect is best-effort.
      }
    }

    this.emitState("disconnected");
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private emitMessage(payload: unknown): void {
    this.messageListeners.forEach((listener) => {
      listener(payload);
    });
  }

  private emitState(state: TransportConnectionState, detail?: string): void {
    this.stateListeners.forEach((listener) => {
      listener(state, detail);
    });
  }

  private async consumeBidirectionalStreams(transport: any, signal: AbortSignal): Promise<void> {
    if (!transport?.incomingBidirectionalStreams) {
      return;
    }

    const reader = transport.incomingBidirectionalStreams.getReader();

    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done || signal.aborted) {
          break;
        }

        if (value?.readable) {
          void this.consumeDataStream(value.readable, signal);
        }

        if (value?.writable?.getWriter) {
          const writer = value.writable.getWriter();
          writer.close().catch(() => undefined);
        }
      }
    } catch (error: unknown) {
      if (!signal.aborted && !this.disconnecting) {
        this.emitState("error", toErrorMessage(error));
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async consumeUnidirectionalStreams(transport: any, signal: AbortSignal): Promise<void> {
    if (!transport?.incomingUnidirectionalStreams) {
      return;
    }

    const reader = transport.incomingUnidirectionalStreams.getReader();

    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done || signal.aborted) {
          break;
        }

        if (value) {
          void this.consumeDataStream(value, signal);
        }
      }
    } catch (error: unknown) {
      if (!signal.aborted && !this.disconnecting) {
        this.emitState("error", toErrorMessage(error));
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async consumeDataStream(readable: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<void> {
    const reader = readable.getReader();
    const chunks: Uint8Array[] = [];

    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          chunks.push(value);
        }
      }
    } catch {
      return;
    } finally {
      reader.releaseLock();
    }

    if (!chunks.length) {
      return;
    }

    const messageText = this.decodeChunks(chunks).trim();
    if (!messageText) {
      return;
    }

    try {
      this.emitMessage(JSON.parse(messageText));
    } catch {
      this.emitMessage(messageText);
    }
  }

  private decodeChunks(chunks: Uint8Array[]): string {
    let totalLength = 0;
    chunks.forEach((chunk) => {
      totalLength += chunk.byteLength;
    });

    const merged = new Uint8Array(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    });

    return new TextDecoder().decode(merged);
  }
}
