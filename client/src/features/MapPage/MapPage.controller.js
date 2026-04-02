import './MapPage.css';
import { MapView } from './MapPage.view.js';
import { initialMapState, replaceAllSlotStatuses, updateSlotStatus } from './MapPage.model.js';
import SocketService from '../../shared/services/SocketService.js';

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
};

const handleSlotUpdate = (data) => {
  const lotId = Number(data?.lot_id);
  if (Number.isFinite(lotId) && lotId !== LOT_ID) return;

  const id = Number(data?.id);
  const status = toUiStatus(data?.newStatus);
  if (!Number.isFinite(id) || !Number.isFinite(status)) return;

  mapState = updateSlotStatus(mapState, id, status);
  MapView.updateSlot(id, status);
};

const handleConnect = async () => {
  if (!socketRef) return;

  socketRef.emit(EVENTS.JOIN_LOT, LOT_ID);

  try {
    await fetchFullState();
  } catch (error) {
    console.error('Cannot load slot snapshot:', error);
  }
};

export const MapController = {
  init: (container) => {
    mapState = cloneInitialState();
    MapView.renderLayout(container, mapState);

    socketRef = SocketService.connect();

    socketRef.on('connect', handleConnect);
    socketRef.on(EVENTS.SLOT_UPDATE, handleSlotUpdate);

    if (socketRef.connected) {
      handleConnect();
    }
  },

  applyBatchStatuses: (statusArray) => {
    // Tac vu noi bo: apply dong loat tu mang dau vao
    mapState = replaceAllSlotStatuses(mapState, statusArray);
    MapView.applyBatchSlots(mapState.slots);
  },

  cleanup: () => {
    if (!socketRef) return;
    socketRef.off('connect', handleConnect);
    socketRef.off(EVENTS.SLOT_UPDATE, handleSlotUpdate);
  }
};
