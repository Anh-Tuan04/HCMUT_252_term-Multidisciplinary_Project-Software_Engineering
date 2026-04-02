// features/map/MapPage.view.js

export const MapView = {
    renderLayout: (container, state) => {
        container.innerHTML = `
            <div class="main-frame">
                <div class="parking-lot">
                    <div class="slots-grid" id="parking-grid"></div>
                </div>
            </div>
        `;

        const grid = container.querySelector('#parking-grid');
        state.slots.forEach(slot => {
            const div = document.createElement('div');
            div.id = `slot-${slot.id}`;
            // Giữ nguyên top-slot/bottom-slot để dùng animation
            div.className = `slot ${slot.id <= 4 ? 'top-slot' : 'bottom-slot'}`;
            div.dataset.status = slot.status; 
            grid.appendChild(div);
            
            // Vẽ nội dung ban đầu (nếu bãi xe đã có xe hoặc đang sửa từ đầu)
            MapView.drawInternalContent(div, slot.status);
        });
    },

    updateSlot: (slotId, status) => {
        const slotEl = document.getElementById(`slot-${slotId}`);
        if (!slotEl) return;

        const oldStatus = parseInt(slotEl.dataset.status);
        if (oldStatus === status) return;

        // --- KỊCH BẢN 1: XE CHẠY RA (Từ 1 sang 0 hoặc 2) ---
        if (oldStatus === 1 && status !== 1) {
            const car = slotEl.querySelector('.car');
            if (car) {
                car.classList.remove('car-animate');
                car.classList.add('car-exit'); // Kích hoạt keyframe exitUp/Down trong CSS

                // Đợi 0.8s (khớp với thời gian animation ra) rồi mới đổi status
                setTimeout(() => {
                    slotEl.dataset.status = status;
                    MapView.drawInternalContent(slotEl, status);
                }, 800);
                return;
            }
        }

        // --- KỊCH BẢN 2: CÁC THAY ĐỔI KHÁC (Xe vào hoặc chuyển sang Sửa) ---
        slotEl.dataset.status = status;
        MapView.drawInternalContent(slotEl, status);
    },

    applyBatchSlots: (slots) => {
        const list = Array.isArray(slots) ? slots : [];

        list.forEach((slot) => {
            const slotEl = document.getElementById(`slot-${slot.id}`);
            if (!slotEl) return;

            const status = Number(slot.status);
            const safeStatus = Number.isFinite(status) ? status : 0;

            slotEl.dataset.status = safeStatus;
            MapView.drawInternalContent(slotEl, safeStatus);
        });
    },

    // Hàm để vẽ ruột ô đỗ
    drawInternalContent: (slotEl, status) => {
        slotEl.innerHTML = ''; // Xóa sạch nội dung cũ

        if (status === 1) {
            // Hiển thị xe và chạy animation vào
            slotEl.innerHTML = '<div class="car car-animate"></div>';
        } else if (status === 2) {
            // Hiển thị khung đỏ và Icon nhấp nháy từ Asset
            slotEl.innerHTML = `
                <div class="fixing-warning">
                    <div class="warning-icon"></div>
                </div>
            `;
        }
    }
};