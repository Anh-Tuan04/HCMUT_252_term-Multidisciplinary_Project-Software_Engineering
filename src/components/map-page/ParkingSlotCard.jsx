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

    // EFFECT 1: Dành riêng cho lần đầu tiên hiển thị (F5, Reload không được tính là lần đầu nên nó không chạy)
    useEffect(() => {
        // Nếu khi vừa load xong mà ô này đang có xe
        if (slot.status === 'occupied') {
            setAnimationClass('anim-in');
            
            // Xóa class sau khi diễn xong để không bị kẹt hiệu ứng
            const timer = setTimeout(() => {
                setAnimationClass('');
            }, 600);

            return () => clearTimeout(timer);
        }
    }, []); // [] đảm bảo chỉ chạy 1 lần duy nhất khi Mount
    
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
/*
Các bước hiệu ứng:
1. Khi lần đầu tiên component được mount, nếu slot đã có xe (status = 'occupied'), sẽ áp dụng class 'anim-in' để chạy hiệu ứng xe đi vào.
2. Khi status thay đổi từ 'occupied' sang 'empty' hoặc 'warning', sẽ áp dụng class 'anim-out' để chạy hiệu ứng xe chạy ra, sau đó mới cập nhật displayStatus để hiển thị ô trống hoặc cảnh báo.
3. Khi status thay đổi từ 'empty' hoặc 'warning' sang 'occupied', sẽ ngay lập tức cập nhật displayStatus thành 'occupied' để hiển thị xe, sau đó áp dụng class 'anim-in' để chạy hiệu ứng xe đi vào.
Do khi tải lại trang hoặc ấn nút reload, các trạng thái đã được gán ngay khi nhận thông tin từ server nên không có trạng thái trước và sau giống nhau, animation chỉ áp dụng khi trạng thái trước và sau khác nhau, nên reload hay F5 không có animation
*/