const clearFeedbackToneClasses = (feedbackElement) => {
    feedbackElement.classList.remove(
        'map-feedback--success',
        'map-feedback--error',
        'map-feedback--warning',
        'map-feedback--info'
    );
};

const countSlotsByStatus = (slots) => {
    const safeSlots = Array.isArray(slots) ? slots : [];

    const available = safeSlots.filter((slot) => Number(slot.status) === 0).length;
    const occupied = safeSlots.filter((slot) => Number(slot.status) === 1).length;
    const maintain = safeSlots.filter((slot) => Number(slot.status) === 2).length;

    return {
        total: safeSlots.length,
        available,
        occupied,
        maintain
    };
};

const toDateTimeLabel = (date) => {
    const safeDate = date instanceof Date ? date : new Date();
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(safeDate);
};

export const MapView = {
    renderLayout: (container, state, session) => {
        const userEmail = session?.email ? session.email : 'guest@local';

        container.innerHTML = `
            <div class="main-frame">
                <div class="map-page">
                    <header class="map-topbar">
                        <div class="map-brand">
                            <p class="map-brand-badge">Smart Parking Platform</p>
                            <h1 class="map-title">Realtime Parking Monitor</h1>
                            <p class="map-subtitle">Giam sat tinh trang bai do theo thoi gian thuc, cap nhat lien tuc theo tung vi tri.</p>
                        </div>

                        <div class="map-metrics-grid">
                            <article class="metric-card">
                                <p class="metric-label">Tong cho</p>
                                <p class="metric-value" id="metric-total">0</p>
                            </article>
                            <article class="metric-card metric-card--available">
                                <p class="metric-label">Con trong</p>
                                <p class="metric-value" id="metric-available">0</p>
                            </article>
                            <article class="metric-card metric-card--occupied">
                                <p class="metric-label">Da chiem</p>
                                <p class="metric-value" id="metric-occupied">0</p>
                            </article>
                            <article class="metric-card metric-card--maintain">
                                <p class="metric-label">Bao tri</p>
                                <p class="metric-value" id="metric-maintain">0</p>
                            </article>
                        </div>
                    </header>

                    <section class="map-toolbar">
                        <div class="map-legend">
                            <span class="legend-item"><i class="legend-dot legend-dot--available"></i>Con trong</span>
                            <span class="legend-item"><i class="legend-dot legend-dot--occupied"></i>Da chiem</span>
                            <span class="legend-item"><i class="legend-dot legend-dot--maintain"></i>Bao tri</span>
                        </div>

                        <div class="map-toolbar-meta">
                            <p class="occupancy-chip">Ti le su dung: <strong id="occupancy-rate">0%</strong></p>
                            <button type="button" class="map-action-btn" id="map-refresh-btn">Dong bo du lieu</button>
                            <button type="button" class="map-action-btn map-action-btn--secondary" id="map-logout-btn">Dang xuat</button>
                        </div>
                    </section>

                    <p class="map-feedback map-feedback--hidden" id="map-feedback" aria-live="polite"></p>

                    <section class="map-board-shell">
                        <p class="lane-label lane-label--entry">Entry</p>
                        <div class="parking-lot">
                            <div class="slots-grid" id="parking-grid"></div>
                        </div>
                        <p class="lane-label lane-label--exit">Exit</p>
                    </section>

                    <footer class="map-footer">
                        <p class="footer-item">Nguoi dung: <strong id="map-user-email">${userEmail}</strong></p>
                        <p class="footer-item">Cap nhat luc: <strong id="map-current-time">--:--:--</strong></p>
                    </footer>
                </div>
            </div>
        `;

        const grid = container.querySelector('#parking-grid');
        if (!grid) return;

        state.slots.forEach((slot) => {
            const slotElement = document.createElement('div');
            slotElement.id = `slot-${slot.id}`;
            slotElement.className = `slot ${slot.id <= 4 ? 'top-slot' : 'bottom-slot'}`;
            slotElement.dataset.status = Number(slot.status);
            slotElement.innerHTML = `
                <span class="slot-id">P${slot.id}</span>
                <div class="slot-inner"></div>
            `;

            grid.appendChild(slotElement);
            MapView.drawInternalContent(slotElement, slot.status);
        });
    },

    bindRefresh: (container, handler) => {
        const refreshButton = container.querySelector('#map-refresh-btn');
        if (!refreshButton) return;

        refreshButton.addEventListener('click', () => {
            handler();
        });
    },

    bindLogout: (container, handler) => {
        const logoutButton = container.querySelector('#map-logout-btn');
        if (!logoutButton) return;

        logoutButton.addEventListener('click', () => {
            handler();
        });
    },

    updateSlot: (slotId, status) => {
        const slotElement = document.getElementById(`slot-${slotId}`);
        if (!slotElement) return;

        const oldStatus = Number(slotElement.dataset.status);
        if (oldStatus === status) return;

        if (oldStatus === 1 && status !== 1) {
            const carElement = slotElement.querySelector('.car');
            if (carElement) {
                carElement.classList.remove('car-animate');
                carElement.classList.add('car-exit');

                window.setTimeout(() => {
                    slotElement.dataset.status = Number(status);
                    MapView.drawInternalContent(slotElement, status);
                }, 760);
                return;
            }
        }

        slotElement.dataset.status = Number(status);
        MapView.drawInternalContent(slotElement, status);
    },

    applyBatchSlots: (slots) => {
        const safeSlots = Array.isArray(slots) ? slots : [];

        safeSlots.forEach((slot) => {
            const slotElement = document.getElementById(`slot-${slot.id}`);
            if (!slotElement) return;

            const status = Number(slot.status);
            const safeStatus = Number.isFinite(status) ? status : 0;

            slotElement.dataset.status = safeStatus;
            MapView.drawInternalContent(slotElement, safeStatus);
        });
    },

    drawInternalContent: (slotElement, status) => {
        const slotInnerElement = slotElement.querySelector('.slot-inner');
        if (!slotInnerElement) return;

        slotInnerElement.innerHTML = '';

        if (Number(status) === 1) {
            slotInnerElement.innerHTML = '<div class="car car-animate"></div>';
            return;
        }

        if (Number(status) === 2) {
            slotInnerElement.innerHTML = `
                <div class="fixing-warning">
                    <div class="warning-icon"></div>
                </div>
            `;
        }
    },

    setSummary: (container, slots) => {
        const counters = countSlotsByStatus(slots);
        const occupiedRate = counters.total > 0
            ? Math.round((counters.occupied / counters.total) * 100)
            : 0;

        const totalElement = container.querySelector('#metric-total');
        const availableElement = container.querySelector('#metric-available');
        const occupiedElement = container.querySelector('#metric-occupied');
        const maintainElement = container.querySelector('#metric-maintain');
        const occupancyRateElement = container.querySelector('#occupancy-rate');

        if (totalElement) totalElement.textContent = String(counters.total);
        if (availableElement) availableElement.textContent = String(counters.available);
        if (occupiedElement) occupiedElement.textContent = String(counters.occupied);
        if (maintainElement) maintainElement.textContent = String(counters.maintain);
        if (occupancyRateElement) occupancyRateElement.textContent = `${occupiedRate}%`;
    },

    setFeedback: (container, message, tone = 'info') => {
        const feedbackElement = container.querySelector('#map-feedback');
        if (!feedbackElement) return;

        clearFeedbackToneClasses(feedbackElement);

        if (!message) {
            feedbackElement.textContent = '';
            feedbackElement.classList.add('map-feedback--hidden');
            return;
        }

        feedbackElement.classList.remove('map-feedback--hidden');
        feedbackElement.classList.add(`map-feedback--${tone}`);
        feedbackElement.textContent = message;
    },

    setLoading: (container, isLoading) => {
        const refreshButton = container.querySelector('#map-refresh-btn');
        if (!refreshButton) return;

        refreshButton.disabled = isLoading;
        refreshButton.textContent = isLoading ? 'Dang dong bo...' : 'Dong bo du lieu';
    },

    setCurrentTime: (container, date) => {
        const timeElement = container.querySelector('#map-current-time');
        if (!timeElement) return;

        timeElement.textContent = toDateTimeLabel(date);
    }
};