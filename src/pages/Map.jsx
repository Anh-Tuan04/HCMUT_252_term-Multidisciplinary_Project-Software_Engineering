import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ParkingMapGrid } from '../components/map-page/ParkingMapGrid'
import { logout } from '../services/authService'
import { getParkingLotById, getParkingLots, updateParkingSlotStatus } from '../services/mapService'
import webTransport from '../services/webTransport'
import {
	applyRealtimeSlotUpdate,
	calculateSlotStats,
	createParkingSlotViews,
} from '../utils/mapSlotHelpers'
import '../styles/map-page.css'

const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const WEBTRANSPORT_URL = import.meta.env.VITE_WEBTRANSPORT_URL || 'https://localhost:8443/wt'

function Map() {
	const navigate = useNavigate()
	const [now, setNow] = useState(new Date())
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [errorTimestamp, setErrorTimestamp] = useState(0)
	const [slotViews, setSlotViews] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isReloading, setIsReloading] = useState(false)
	const [isReconnecting, setIsReconnecting] = useState(false)
	const [selectedSlotId, setSelectedSlotId] = useState(null)
	const parkingLotIdRef = useRef(1)
	const webTransportUrlRef = useRef(WEBTRANSPORT_URL)
	const isMountedRef = useRef(true)

	const currentUser = useMemo(() => {
		if (typeof window === 'undefined') {
			return null
		}

		try {
			const rawUser = localStorage.getItem('user_info')
			return rawUser ? JSON.parse(rawUser) : null
		} catch {
			return null
		}
	}, [])

	const adminEnabled = Boolean(
		currentUser && ['ADMIN', 'MANAGER'].includes(String(currentUser.role ?? '').toUpperCase()),
	)

	const slotStats = useMemo(() => calculateSlotStats(slotViews), [slotViews])

	const setError = (message) => {
		setErrorMessage(message)
		setErrorTimestamp(Date.now())
	}

	const loadParkingLotData = async () => {
		try {
			const lotsResponse = await getParkingLots()
			const lots = lotsResponse?.data?.data ?? []

			if (!lotsResponse?.data?.success || !lots.length) {
				setError('Không thể tải danh sách bãi đỗ')
				return false
			}

			const lotId = lots[0].id
			parkingLotIdRef.current = lotId

			const detailsResponse = await getParkingLotById(lotId)
			const parkingLot = detailsResponse?.data?.data

			if (!detailsResponse?.data?.success || !parkingLot) {
				setError('Không thể tải thông tin bãi đỗ')
				return false
			}

			if (!isMountedRef.current) {
				return false
			}

			// create new views and preserve loadedAt for unchanged slots so animations only run for changed ones
			const newViews = createParkingSlotViews(parkingLot.slots ?? [])
			const merged = newViews.map((nv) => {
				const prev = slotViews.find((s) => s.id === nv.id)
				if (prev) {
					if (prev.status !== nv.status) {
						// mark as changed so child can animate
						nv.loadedAt = Date.now()
					} else {
						nv.loadedAt = prev.loadedAt ?? nv.loadedAt
					}
				}
				return nv
			})

			setSlotViews(merged)
			setSelectedSlotId(null)
			return true
		} catch (error) {
			setError(error?.response?.data?.message || error?.message || 'Lỗi tải dữ liệu bãi đỗ')
			return false
		}
	}

	const handleReload = async () => {
		setIsReloading(true)
		try {
			await loadParkingLotData()
		} finally {
			if (isMountedRef.current) {
				setIsReloading(false)
			}
		}
	}

	const handleReconnect = async () => {
		setIsReconnecting(true)
		try {
			await webTransport.disconnect()
			// const url = `${webTransportUrlRef.current}?lotId=${parkingLotIdRef.current}`
			const url = `${webTransportUrlRef.current}`
			await webTransport.connect(url)
		} catch (error) {
			setError(error?.message || 'Không thể kết nối WebTransport')
		} finally {
			if (isMountedRef.current) {
				setIsReconnecting(false)
			}
		}
	}

	useEffect(() => {
		isMountedRef.current = true
		document.body.classList.add('is-logged-in')
		document.body.classList.remove('is-logged-out')

		const timer = window.setInterval(() => setNow(new Date()), 1000)
		let unsubscribeReceive = () => {}

		const handleRealtimeMessage = (message) => {
			if (!message || message.event !== 'slotStatusUpdated' || !message.data) {
				return
			}

			setSlotViews((previousSlots) => {
				return applyRealtimeSlotUpdate(previousSlots, message.data, parkingLotIdRef.current)
			})
		}

		const initialize = async () => {
			try {
				await webTransport.disconnect();
				const loaded = await loadParkingLotData()
				if (!loaded || !isMountedRef.current) {
					return
				}

				unsubscribeReceive = webTransport.receive(handleRealtimeMessage)
				// const url = `${webTransportUrlRef.current}?lotId=${parkingLotIdRef.current}`
				const url = `${webTransportUrlRef.current}`
				await webTransport.connect(url)
			} catch (error) {
				if (isMountedRef.current) {
					setError(error?.message || 'Không thể khởi tạo WebTransport')
				}
			} finally {
				if (isMountedRef.current) {
					setIsLoading(false)
				}
			}
		}

		void initialize()
		return () => {
			document.body.classList.remove('is-logged-in')
			window.clearInterval(timer)
			unsubscribeReceive()
			void webTransport.disconnect()
		}
	}, [])

	const timeLabel = useMemo(() => {
		const hours = String(now.getHours()).padStart(2, '0')
		const minutes = String(now.getMinutes()).padStart(2, '0')
		return `${hours}:${minutes}`
	}, [now])

	const dateLabel = useMemo(() => {
		const day = dayNames[now.getDay()]
		const date = String(now.getDate()).padStart(2, '0')
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const year = now.getFullYear()
		return `${day}, ngày ${date} tháng ${month} năm ${year}`
	}, [now])

	const handleLogout = async () => {
		try {
			await logout()
		} catch {
			// Ignore logout errors; clear local state anyway.
		} finally {
			localStorage.removeItem('user_info')
		}

		navigate('/')
	}

	const handleSelectSlot = (slotId) => {
		if (!adminEnabled) return
		setSelectedSlotId((prev) => (prev === slotId ? null : slotId))
	}

	const handleCloseSlotMenu = () => setSelectedSlotId(null)

	const handleChangeSlotStatus = async (slotId, visualStatus) => {
		if (!adminEnabled) return

		// map visual status to server status
		const toServer = (vs) => {
			switch (vs) {
				case 'empty':
					return 'AVAILABLE'
				case 'occupied':
					return 'OCCUPIED'
				case 'warning':
					return 'MAINTAIN'
				default:
					return 'AVAILABLE'
			}
		}

		// optimistically mark updating
		setSlotViews((prev) => prev.map((s) => (s.id === slotId ? { ...s, isUpdating: true } : s)))

		try {
			const resp = await updateParkingSlotStatus(slotId, { status: toServer(visualStatus) })
			const data = resp?.data?.data
			if (resp?.data?.success && data) {
				setSlotViews((prev) =>
					prev.map((s) => {
						if (s.id !== slotId) return s
						const nextStatus = visualStatus
						return { ...s, status: nextStatus, isUpdating: false, loadedAt: Date.now() }
					}),
				)
				setSelectedSlotId(null)
			} else {
				throw new Error(resp?.data?.message || 'Không thể cập nhật trạng thái')
			}
		} catch (error) {
			setError(error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật trạng thái')
			setSlotViews((prev) => prev.map((s) => (s.id === slotId ? { ...s, isUpdating: false } : s)))
		}
	}

	return (
		<div className="map-page">
			<div className="clock-card">
				<div className="clock-time">{timeLabel}</div>
				<div className="clock-date">{dateLabel}</div>
			</div>

			<div className="slot-stats">
				<div className="stats-col">
					<div className="stats-title">Trống</div>
					<div className="available-count stats-value">{slotStats.empty}/{slotStats.total}</div>
				</div>
				<div className="stats-divider"></div>
				<div className="stats-col">
					<div className="stats-title">Đã đỗ</div>
					<div className="occupied-count stats-value">{slotStats.occupied}/{slotStats.total}</div>
				</div>
			</div>

			<div className="top-right-actions">
				<button
					type="button"
					className="corner-btn open-settings auth-only"
					onClick={() => setIsSidebarOpen(true)}
				>
					<span className="material-icons setting-btn">settings</span>
				</button>
				<button type="button" className="corner-btn auth-only">
					<img
						className="dashboard-btn"
						src="../src/assets/MapPage/DashboardIcon.svg"
						alt="Dashboard"
					/>
				</button>
				<button type="button" className="corner-btn auth-only">
					<span className="material-icons card-btn">credit_card</span>
				</button>
				<button 
					type="button" 
					className="corner-btn auth-only"
					onClick={() => navigate('/parking-session')}
				>
					<span className="material-icons history-btn">manage_history</span>
				</button>
				<button
					type="button"
					className="corner-btn auth-only btn-wrapper"
					onClick={handleReconnect}
					disabled={isLoading || isReconnecting}
				>
					<div className="btn-guide" style={{ right: '70px' }}>
						<span className="btn-note">Kết nối Webtransport lại</span>
					</div>
					<span className={`material-icons ${isReconnecting ? 'spinning-icon-clockwise' : ''}`}>
						sync
					</span>
				</button>
			</div>

			<ParkingMapGrid
				slots={slotViews}
				adminEnabled={adminEnabled}
				selectedSlotId={selectedSlotId}
				onSelectSlot={handleSelectSlot}
				onCloseSlotMenu={handleCloseSlotMenu}
				onChangeSlotStatus={handleChangeSlotStatus}
			/>

			<div
				key={errorTimestamp}
				id="global-error-toast"
				className={`error-toast ${errorMessage ? 'is-visible' : ''}`}
				aria-live="polite"
				aria-hidden={!errorMessage}
			>
				<span className="error-toast-text">{errorMessage}</span>
				<button
					type="button"
					className="error-toast-close"
					aria-label="Đóng thông báo"
					onClick={() => setErrorMessage('')}
				>
					❌
				</button>
			</div>

			<button
				className={`reload-btn ${isReloading ? 'is-loading' : ''}`}
				type="button"
				onClick={handleReload}
				disabled={isLoading || isReloading}
			>
				<img
					className={isReloading ? 'spinning-icon-clockwise' : ''}
					src="../src/assets/MapPage/ReloadIcon.svg"
					alt="Reload"
				/>
			</button>

			<div className="up-arrow">↑</div>

			<div className={`settings-sidebar ${isSidebarOpen ? 'active' : ''}`}>
				<div className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
					❌
				</div>
				<h2>Cài đặt</h2>
				<button className="sidebar-btn" type="button">
					<Link to="/parking-session">Lịch sử gửi xe</Link>
				</button>
				<button className="sidebar-btn" type="button">
					<Link to="/change-password">Đặt lại mật khẩu</Link>
				</button>
				<button type="button" className="sidebar-btn logout" onClick={handleLogout}>
					<span className="material-icons">logout</span>
					<span>Đăng xuất</span>
				</button>
			</div>
		</div>
	)
}

export default Map


/*
respone của getParkingLots
{
    "success": true,
    "message": "Lấy danh sách bãi đỗ thành công",
    "data": [
        {
            "id": 1,
            "name": "A",
            "location": "Main Area"
        }
    ]
}


response của getParkingLotById
{
    "success": true,
    "message": "Lấy thông tin bãi đỗ thành công",
    "data": {
        "id": 1,
        "name": "A",
        "location": "Main Area",
        "slots": [
            {
                "id": 1,
                "name": "A1",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 1
            },
            {
                "id": 2,
                "name": "A2",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 2
            },
            {
                "id": 3,
                "name": "A3",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 3
            },
            {
                "id": 4,
                "name": "A4",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 4
            },
            {
                "id": 5,
                "name": "A5",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 5
            },
            {
                "id": 6,
                "name": "A6",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 6
            },
            {
                "id": 7,
                "name": "A7",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 7
            },
            {
                "id": 8,
                "name": "A8",
                "status": "AVAILABLE",
                "device_mac": "SENSOR_A_001",
                "port_number": 8
            }
        ],
        "stats": {
            "total": 8,
            "available": 8,
            "occupied": 0,
            "maintain": 0
        }
    }
}


response của updateSlotStatus
{
    "success": true,
    "message": "Cập nhật trạng thái thành công",
    "data": {
        "changed": true,
        "id": 2,
        "lot_id": 1,
        "name": "A2",
        "message": "Cập nhật trạng thái thành công",
        "old_status": "AVAILABLE",
        "new_status": "OCCUPIED"
    }
}
*/
