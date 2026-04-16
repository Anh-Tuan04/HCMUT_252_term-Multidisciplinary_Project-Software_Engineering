import './MapPage.css';
import { MapView } from './MapPage.view.js';
import { initialMapState, replaceAllSlotStatuses, updateSlotStatus } from './MapPage.model.js';
import SocketService from '../../shared/services/SocketService.js';
import AuthSessionService from '../../shared/services/AuthSessionService.js';

const EVENTS = {
  JOIN_LOT: 'join_lot',
  SLOT_UPDATE: 'SLOT_UPDATE'
};

const LOT_ID = Number(import.meta.env.VITE_LOT_ID || 1);
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const SERVER_TO_UI_STATUS = {
  AVAILABLE: 0,
  OCCUPIED: 1,
  MAINTAIN: 2
};

const cloneInitialState = () => ({
  slots: initialMapState.slots.map((slot) => ({ ...slot }))
});

let mapState = cloneInitialState();
let socketRef = null;
let containerRef = null;
let routerRef = null;
let clockIntervalId = null;

const clearRuntime = () => {
  if (clockIntervalId) {
    window.clearInterval(clockIntervalId);
    clockIntervalId = null;
  }
};

const updateSummary = () => {
  if (!containerRef) return;
  MapView.setSummary(containerRef, mapState.slots);
};

const startClockTicker = () => {
  if (!containerRef) return;

  MapView.setCurrentTime(containerRef, new Date());

  clockIntervalId = window.setInterval(() => {
    if (!containerRef) return;
    MapView.setCurrentTime(containerRef, new Date());
  }, 1000);
};

const toUiStatus = (serverStatus) => {
  if (typeof serverStatus === 'number') {
    return Number.isFinite(serverStatus) ? serverStatus : 0;
  }
  return SERVER_TO_UI_STATUS[serverStatus] ?? 0;
};

const fetchFullState = async () => {
  const response = await fetch(`${API_BASE}/api/slots?lotId=${LOT_ID}`);
  if (!response.ok) throw new Error(`Failed to fetch slots: ${response.status}`);

  const json = await response.json();
  if (!json?.success) return;

  const slots = Array.isArray(json?.data?.slots) ? json.data.slots : [];
  mapState = cloneInitialState();

  slots.forEach((slot) => {
    const id = Number(slot?.id);
    if (!Number.isFinite(id)) return;
    mapState = updateSlotStatus(mapState, id, toUiStatus(slot?.status));
  });

  MapView.applyBatchSlots(mapState.slots);
  updateSummary();
};

const handleSlotUpdate = (data) => {
  const lotId = Number(data?.lot_id);
  if (Number.isFinite(lotId) && lotId !== LOT_ID) return;

  const id = Number(data?.id);
  const status = toUiStatus(data?.newStatus);
  if (!Number.isFinite(id) || !Number.isFinite(status)) return;

  mapState = updateSlotStatus(mapState, id, status);
  MapView.updateSlot(id, status);
  updateSummary();
};

const handleConnect = async () => {
  if (!socketRef) return;

  socketRef.emit(EVENTS.JOIN_LOT, LOT_ID);

  if (containerRef) {
    MapView.setFeedback(containerRef, 'Da ket noi socket. Dang dong bo snapshot bai xe...', 'info');
  }

  try {
    await fetchFullState();

    if (containerRef) {
      MapView.setFeedback(containerRef, 'He thong realtime dang hoat dong on dinh.', 'success');
    }
  } catch (error) {
    console.error('Cannot load slot snapshot:', error);

    if (containerRef) {
      MapView.setFeedback(containerRef, 'Khong the lay snapshot tu server. Vui long thu dong bo lai.', 'error');
    }
  }
};

const handleManualRefresh = async () => {
  if (!containerRef) return;

  MapView.setLoading(containerRef, true);
  MapView.setFeedback(containerRef, 'Dang dong bo du lieu moi nhat tu server...', 'info');

  try {
    await fetchFullState();
    MapView.setFeedback(containerRef, 'Da cap nhat du lieu bai xe thanh cong.', 'success');
  } catch (error) {
    console.error('Manual refresh failed:', error);
    MapView.setFeedback(containerRef, 'Dong bo that bai. Vui long kiem tra ket noi va thu lai.', 'error');
  } finally {
    MapView.setLoading(containerRef, false);
  }
};

const handleLogout = () => {
  AuthSessionService.signOut();
  if (routerRef) {
    routerRef.navigate('/auth/login');
  }
};

export const MapController = {
  init: (container, router) => {
    if (!AuthSessionService.isAuthenticated()) {
      if (router) {
        router.navigate('/auth/login');
      }
      return;
    }

    clearRuntime();

    containerRef = container;
    routerRef = router;

    mapState = cloneInitialState();

    const session = AuthSessionService.getSession();
    MapView.renderLayout(containerRef, mapState, session);
    MapView.setSummary(containerRef, mapState.slots);
    MapView.setCurrentTime(containerRef, new Date());
    MapView.bindRefresh(containerRef, handleManualRefresh);
    MapView.bindLogout(containerRef, handleLogout);
    startClockTicker();

    socketRef = SocketService.connect();

    socketRef.on('connect', handleConnect);
    socketRef.on(EVENTS.SLOT_UPDATE, handleSlotUpdate);

    MapView.setFeedback(containerRef, 'Dang ket noi he thong realtime...', 'info');

    if (socketRef.connected) {
      handleConnect();
    }
  },

  applyBatchStatuses: (statusArray) => {
    mapState = replaceAllSlotStatuses(mapState, statusArray);
    MapView.applyBatchSlots(mapState.slots);
    updateSummary();
  },

  cleanup: () => {
    clearRuntime();

    if (socketRef) {
      socketRef.off('connect', handleConnect);
      socketRef.off(EVENTS.SLOT_UPDATE, handleSlotUpdate);
    }

    socketRef = null;

    containerRef = null;
    routerRef = null;
  }
};
