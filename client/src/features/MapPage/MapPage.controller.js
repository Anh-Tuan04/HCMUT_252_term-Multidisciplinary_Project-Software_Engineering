import './MapPage.css';
import { MapView } from './MapPage.view.js';
import { initialMapState, replaceAllSlotStatuses, updateSlotStatus } from './MapPage.model.js';
import SocketService from '../../shared/services/SocketService.js';

const EVENTS = {
  SLOT_UPDATE: 'slot_update',
  SLOTS_SNAPSHOT: 'slots_snapshot'
};

const cloneInitialState = () => ({
  slots: initialMapState.slots.map((slot) => ({ ...slot }))
});

let mapState = cloneInitialState();
let socketRef = null;

const handleSlotUpdate = (data) => {
  const id = Number(data?.id);
  const status = Number(data?.status);
  if (!Number.isFinite(id) || !Number.isFinite(status)) return;

  mapState = updateSlotStatus(mapState, id, status);
  MapView.updateSlot(id, status);
};

const handleSnapshot = (data) => {
  const arr = Array.isArray(data?.statuses) ? data.statuses : [];
  mapState = replaceAllSlotStatuses(mapState, arr);
  MapView.applyBatchSlots(mapState.slots);
};

export const MapController = {
  init: (container) => {
    mapState = cloneInitialState();
    MapView.renderLayout(container, mapState);

    socketRef = SocketService.connect();

    // Tac vu 1: update 1 slot
    socketRef.on(EVENTS.SLOT_UPDATE, handleSlotUpdate);

    // Tac vu 2: update dong loat
    socketRef.on(EVENTS.SLOTS_SNAPSHOT, handleSnapshot);
  },

  applyBatchStatuses: (statusArray) => {
    // Tac vu noi bo: apply dong loat tu mang dau vao
    mapState = replaceAllSlotStatuses(mapState, statusArray);
    MapView.applyBatchSlots(mapState.slots);
  },

  cleanup: () => {
    if (!socketRef) return;
    socketRef.off(EVENTS.SLOT_UPDATE, handleSlotUpdate);
    socketRef.off(EVENTS.SLOTS_SNAPSHOT, handleSnapshot);
  }
};
