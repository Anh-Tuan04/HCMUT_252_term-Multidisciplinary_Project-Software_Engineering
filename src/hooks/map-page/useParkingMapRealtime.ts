import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { API_BASE_URL } from "../../constants/apiConfig";
import { MAP_PAGE_CONFIG } from "../../constants/mapPageConfig";
import { FetchApiClient } from "../../servies/http/fetchApiClient";
import { RestParkingLotGateway } from "../../servies/parkingLotApi";
import type { TransportConnectionState } from "../../servies/transport/parkingTransport";
import { WebTransportParkingClient } from "../../servies/transport/webTransportParkingClient";
import type { ParkingRealtimeEnvelope, ParkingSlotView, SlotStatusUpdatedPayload } from "../../types/parking";
import { applyRealtimeSlotUpdate, applySnapshot } from "../../utils/slotMapper";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

interface UseParkingMapRealtimeOptions {
  accessToken?: string;
  setSlots: Dispatch<SetStateAction<ParkingSlotView[]>>;
  onError?: (message: string) => void;
}

export const useParkingMapRealtime = ({ accessToken, setSlots, onError }: UseParkingMapRealtimeOptions) => {
  const [connectionState, setConnectionState] = useState<TransportConnectionState>("idle");
  const [connectionDetail, setConnectionDetail] = useState("");
  const [reloadError, setReloadError] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [lastReloadAt, setLastReloadAt] = useState<Date | null>(null);

  const transportRef = useRef(new WebTransportParkingClient(MAP_PAGE_CONFIG.webTransportUrl));
  const apiClientRef = useRef(new FetchApiClient(API_BASE_URL));
  const parkingLotGatewayRef = useRef(new RestParkingLotGateway(apiClientRef.current));

  const syncFromApiSnapshot = useCallback(async () => {
    if (!MAP_PAGE_CONFIG.enableApiSnapshot || !accessToken) {
      return;
    }

    const snapshotResult = await parkingLotGatewayRef.current.getSlots(
      MAP_PAGE_CONFIG.lotId,
      accessToken,
    );

    if (!snapshotResult.success || !Array.isArray(snapshotResult.data)) {
      throw new Error(snapshotResult.message || "Không thể tải dữ liệu parking lot");
    }

    const snapshotData = snapshotResult.data ?? [];
    setSlots((previous) => applySnapshot(previous, snapshotData));
  }, [accessToken, setSlots]);

  useEffect(() => {
    const transport = transportRef.current;

    const unSubState = transport.onStateChange((state, detail) => {
      setConnectionState(state);
      setConnectionDetail(detail ?? "");
    });

    const unSubMessage = transport.onMessage((payload) => {
      if (!isObject(payload)) {
        return;
      }

      const envelope = payload as ParkingRealtimeEnvelope;
      if (envelope.event !== "slotStatusUpdated" || !isObject(envelope.data)) {
        return;
      }

      setSlots((previous) =>
        applyRealtimeSlotUpdate(
          previous,
          envelope.data as SlotStatusUpdatedPayload,
          MAP_PAGE_CONFIG.lotId,
        ),
      );
    });

    void transport.connect();
    void syncFromApiSnapshot().catch((error: unknown) => {
      if (error instanceof Error) {
        onError?.(error.message);
        setReloadError(error.message);
      }
    });

    return () => {
      unSubState();
      unSubMessage();
      void transport.disconnect();
    };
  }, [syncFromApiSnapshot, setSlots]);

  const reload = useCallback(async () => {
    setIsReloading(true);
    setReloadError("");

    try {
      await transportRef.current.reconnect();
      await syncFromApiSnapshot();
      setLastReloadAt(new Date());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Reload thất bại";
      onError?.(message);
      setReloadError(message);
    } finally {
      setIsReloading(false);
    }
  }, [syncFromApiSnapshot]);

  return {
    connectionState,
    connectionDetail,
    reloadError,
    isReloading,
    lastReloadAt,
    reload,
    realtimeEndpoint: MAP_PAGE_CONFIG.webTransportUrl,
    usingApiSnapshot: MAP_PAGE_CONFIG.enableApiSnapshot && Boolean(accessToken),
  };
};