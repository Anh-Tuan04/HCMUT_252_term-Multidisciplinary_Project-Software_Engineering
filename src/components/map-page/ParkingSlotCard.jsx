import { useEffect, useRef, useState } from 'react'
import carImage from '../../assets/MapPage/BlueCarTopView.svg'

export function ParkingSlotCard({
    slot,
    adminEnabled,
    isSelected,
    onSelect,
    onCloseMenu,
    onChangeStatus,
}) {
    const [animationClass, setAnimationClass] = useState('')
    // displayStatus giúp giữ trạng thái "Có xe" cho đến khi xe chạy ra xong
    const [displayStatus, setDisplayStatus] = useState(slot.status)
    
    const previousStatusRef = useRef(slot.status)
    const clickable = adminEnabled && !slot.isUpdating

    useEffect(() => {
        const prevStatus = previousStatusRef.current
        const nextStatus = slot.status

        if (prevStatus !== nextStatus) {
            // TRƯỜNG HỢP 1: Đang có xe -> Chuyển sang Trống hoặc Bảo trì
            if (prevStatus === 'occupied' && nextStatus !== 'occupied') {
                setAnimationClass('anim-out')
                // Đợi xe chạy ra xong (600ms) mới cho biển báo/ô trống hiện ra
                setTimeout(() => {
                    setDisplayStatus(nextStatus)
                    setAnimationClass('')
                }, 600)
            } 
            // TRƯỜNG HỢP 2: Đang Trống/Bảo trì -> Có xe đi vào
            else if (prevStatus !== 'occupied' && nextStatus === 'occupied') {
                setDisplayStatus('occupied')
                setAnimationClass('anim-in')
                setTimeout(() => setAnimationClass(''), 600)
            } 
            // TRƯỜNG HỢP 3: Cập nhật giữa các trạng thái không có xe (ví dụ: Trống -> Bảo trì)
            else {
                setDisplayStatus(nextStatus)
            }

            previousStatusRef.current = nextStatus
        }
    }, [slot.status])

    return (
        <div
            // Class CSS dựa trên displayStatus để không bị hiện warning sớm
            className={`map-item map-item-${slot.orientation} state-${displayStatus} ${isSelected ? 'is-selecting' : ''} ${animationClass} ${adminEnabled ? 'admin-enabled' : ''}`}
            aria-label={`Slot ${slot.name} status ${slot.status}`}
            style={{ cursor: adminEnabled ? (clickable ? 'pointer' : 'not-allowed') : 'default' }}
            onClick={() => {
                if (clickable) onSelect(slot.id)
            }}
            // Đã xóa onSelect ở onMouseEnter để fix lỗi "di chuột tự hiện menu"
            onMouseEnter={() => {}} 
            onMouseLeave={() => {
                if (adminEnabled) onCloseMenu()
            }}
        >
            {/* HIỂN THỊ XE: Hiện khi đang có xe HOẶC đang trong lúc chạy xe ra */}
            {(displayStatus === 'occupied' || animationClass === 'anim-out') && (
                <img className="car-visual" src={carImage} alt={`Slot ${slot.name}`} />
            )}

            {/* HIỂN THỊ WARNING: Chỉ hiện khi displayStatus đã là warning và ĐÃ CHẠY XONG animation */}
            {displayStatus === 'warning' && animationClass === '' && (
                <div className="warning-box" aria-hidden="true">
                    <span className="warning-icon">⚠</span>
                </div>
            )}

            {/* MENU ADMIN */}
            {adminEnabled && isSelected ? (
                <div
                    className="slot-menu"
                    role="group"
                    onClick={(event) => event.stopPropagation()}
                >
                    <button type="button" className="slot-menu-close" onClick={onCloseMenu}>
                        ❌
                    </button>
                    <button type="button" className="slot-btn btn-occupied" onClick={() => onChangeStatus(slot.id, 'occupied')}>
                        Có xe
                    </button>
                    <button type="button" className="slot-btn btn-empty" onClick={() => onChangeStatus(slot.id, 'empty')}>
                        Còn trống
                    </button>
                    <button type="button" className="slot-btn btn-warning" onClick={() => onChangeStatus(slot.id, 'warning')}>
                        Bảo trì
                    </button>
                </div>
            ) : null}
        </div>
    )
}
