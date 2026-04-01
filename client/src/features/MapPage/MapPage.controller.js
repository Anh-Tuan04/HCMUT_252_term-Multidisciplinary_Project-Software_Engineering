import './MapPage.css';
import { MapView } from './MapPage.view.js';
import { initialMapState } from './MapPage.model.js';
import SocketService from '../../shared/services/SocketService.js';

export const MapController = {
    init: (container) => {
        MapView.renderLayout(container, initialMapState);
        
        const socket = SocketService.connect();
        
        // Lắng nghe sự kiện từ Server
        socket.on('slot_update', (data) => {
            // data: { id: number, status: 0|1|2 } (chỉnh lại format sau khi thống nhất với backend)
            MapView.updateSlot(data.id, data.status);
        });
    },

    cleanup: () => {
        const socket = SocketService.connect();
        // Gỡ bỏ listener để không bị lặp lại khi quay lại trang
        socket.off('slot_update'); 
        console.log("Đã dọn dẹp MapPage");
    }
};