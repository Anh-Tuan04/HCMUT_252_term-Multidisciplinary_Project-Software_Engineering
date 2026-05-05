import instance from '../utils/axiosInterceptor';
const URL_BACKEND = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`


/**
 * @template T
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - `true` khi server xử lý thành công.
 * @property {string} message - Thông điệp mô tả kết quả.
 * @property {T} data - Dữ liệu trả về từ server.
 */

/**
 * @typedef {Object} ParkingLotResponse
 * @property {number} id - ID bãi đỗ.
 * @property {string} name - Tên bãi đỗ.
 * @property {string | null} [location] - Vị trí (có thể `null`).
 */

/**
 * @typedef {Object} ParkingLotSlotResponse
 * @property {number} id - ID vị trí đỗ.
 * @property {string} name - Tên vị trí đỗ.
 * @property {string} status - Trạng thái: `AVAILABLE`, `OCCUPIED`, `MAINTAIN`.
 * @property {string} device_mac - MAC thiết bị IoT đang gắn.
 * @property {number} port_number - Cổng thiết bị đang gắn.
 */

/**
 * @typedef {Object} ParkingLotStatsResponse
 * @property {number} total - Tổng số vị trí.
 * @property {number} available - Số vị trí trống.
 * @property {number} occupied - Số vị trí đang có xe.
 * @property {number} maintain - Số vị trí đang bảo trì.
 */

/**
 * @typedef {Object} ParkingLotDetailResponse
 * @property {number} id - ID bãi đỗ.
 * @property {string} name - Tên bãi đỗ.
 * @property {string | null} [location] - Vị trí bãi đỗ.
 * @property {ParkingLotSlotResponse[]} slots - Danh sách vị trí đỗ trong bãi.
 * @property {ParkingLotStatsResponse} stats - Thống kê tổng quan bãi đỗ.
 */

/**
 * @typedef {Object} ParkingLotGateResponse
 * @property {number} id - ID cổng.
 * @property {string} name - Tên cổng.
 * @property {string} type - Loại cổng: `ENTRY` hoặc `EXIT`.
 * @property {string} mac_address - Địa chỉ MAC của cổng.
 * @property {boolean} is_active - Trạng thái hoạt động.
 */

/**
 * @typedef {Object} GateResponse
 * @property {number} id - ID cổng.
 * @property {string} name - Tên cổng.
 * @property {string} type - Loại cổng: `ENTRY` hoặc `EXIT`.
 * @property {string} mac_address - Địa chỉ MAC của cổng.
 * @property {number} lot_id - ID bãi đỗ liên kết.
 * @property {boolean} is_active - Trạng thái hoạt động.
 */

/**
 * @typedef {Object} SlotHistoryResponse
 * @property {number} id - ID lịch sử.
 * @property {number} slot_id - ID vị trí đỗ.
 * @property {string | null} old_device - MAC thiết bị cũ (nếu có).
 * @property {string | null} new_device - MAC thiết bị mới (nếu có).
 * @property {number | null} old_port - Port cũ (nếu có).
 * @property {number | null} new_port - Port mới (nếu có).
 * @property {string} action - Loại hành động lịch sử.
 * @property {string} created_at - Thời điểm tạo lịch sử (ISO datetime).
 * @property {number | null} user_id - ID người thực hiện (nếu có).
 * @property {string | null} user_email - Email người thực hiện (nếu có).
 */

/**
 * @typedef {Object} UpdateSlotStatusResponse
 * @property {boolean} changed - Có thay đổi trạng thái hay không.
 * @property {number} id - ID vị trí đỗ.
 * @property {number} lot_id - ID bãi đỗ.
 * @property {string} name - Tên vị trí đỗ.
 * @property {string} message - Thông điệp mô tả kết quả cập nhật.
 * @property {string} old_status - Trạng thái cũ.
 * @property {string} new_status - Trạng thái mới.
 */

/**
 * @typedef {Object} CreateParkingLotPayload
 * @property {string} name - Tên bãi đỗ.
 * @property {string} location - Vị trí bãi đỗ.
 */

/**
 * @typedef {Object} UpdateParkingLotPayload
 * @property {string} [name] - Tên bãi đỗ mới.
 * @property {string} [location] - Vị trí mới.
 */

/**
 * @typedef {Object} CreateGatePayload
 * @property {string} name - Tên cổng.
 * @property {string} type - `ENTRY` hoặc `EXIT`.
 * @property {string} mac_address - Địa chỉ MAC của cổng.
 * @property {number} lot_id - ID bãi đỗ liên kết.
 */

/**
 * @typedef {Object} UpdateGatePayload
 * @property {string} [name] - Tên cổng mới.
 * @property {string} [type] - `ENTRY` hoặc `EXIT`.
 * @property {string} [mac_address] - Địa chỉ MAC mới.
 * @property {boolean} [is_active] - Cập nhật trạng thái hoạt động.
 */

/**
 * @typedef {Object} CreateParkingSlotPayload
 * @property {string} name - Tên vị trí đỗ.
 * @property {number} lot_id - ID bãi đỗ.
 * @property {string} device_mac - MAC thiết bị IoT.
 * @property {number} port_number - Cổng thiết bị.
 */

/**
 * @typedef {Object} ChangeSlotDevicePayload
 * @property {string} device_mac - MAC thiết bị mới.
 * @property {number} port_number - Cổng thiết bị mới.
 */

/**
 * @typedef {Object} UpdateSlotStatusPayload
 * @property {string} status - Trạng thái mới: `AVAILABLE`, `OCCUPIED`, `MAINTAIN`.
 */

/**
 * @typedef {Object} SensorUpdateSlotStatusPayload
 * @property {string} mac - MAC thiết bị gửi trạng thái.
 * @property {number} port - Cổng thiết bị gửi trạng thái.
 * @property {boolean} is_occupied - Cờ trạng thái đang có xe hay không.
 */

/**
 * Lấy toàn bộ danh sách bãi đỗ xe.
 *	Đúng về path
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotResponse[]>>>} Response chứa danh sách bãi đỗ.
 */
export const getParkingLots = () => {
	return instance.get(`${URL_BACKEND}/parking-lots`)
}

/**
 * Lấy chi tiết một bãi đỗ theo ID, bao gồm danh sách slot và thống kê.
 *	Đúng về path
 * @param {number} lotId - ID bãi đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotDetailResponse>>>} Response chứa dữ liệu chi tiết bãi đỗ.
 */
export const getParkingLotById = (lotId) => {
	return instance.get(`${URL_BACKEND}/parking-lots/${lotId}`)
}

/**
 * Tạo mới bãi đỗ xe.
 *	Đúng về path
 * @param {CreateParkingLotPayload} payload - Payload tạo bãi đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotResponse>>>} Response chứa bãi đỗ vừa tạo.
 */
export const createParkingLot = (payload) => {
	return instance.post(`${URL_BACKEND}/parking-lots`, payload)
}

/**
 * Cập nhật thông tin bãi đỗ theo ID.
 *	Sai về path
 * @param {number} lotId - ID bãi đỗ.
 * @param {UpdateParkingLotPayload} payload - Payload cập nhật.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotResponse>>>} Response chứa bãi đỗ sau cập nhật.
 */
export const updateParkingLot = (lotId, payload) => {
	return instance.put(`${URL_BACKEND}/parking-lots/${lotId}`, payload)
}

/**
 * Lấy danh sách cổng theo bãi đỗ.
 *	Đúng về path
 * @param {number} lotId - ID bãi đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotGateResponse[]>>>} Response chứa danh sách cổng.
 */
export const getParkingLotGates = (lotId) => {
	return instance.get(`${URL_BACKEND}/parking-lots/${lotId}/gates`)
}

/**
 * Tạo mới cổng (gate) cho bãi đỗ.
 *	Đúng về path
 * @param {CreateGatePayload} payload - Payload tạo cổng theo chuẩn server.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<GateResponse>>>} Response chứa thông tin cổng mới.
 */
export const createGate = (payload) => {
	return instance.post(`${URL_BACKEND}/gates`, payload)
}

/**
 * Lấy thông tin cổng theo ID.
 *	Đúng về path
 * @param {number} gateId - ID cổng.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<GateResponse>>>} Response chứa thông tin cổng.
 */
export const getGateById = (gateId) => {
	return instance.get(`${URL_BACKEND}/gates/${gateId}`)
}

/**
 * Cập nhật thông tin cổng theo ID.
 *	Đúng về path
 * @param {number} gateId - ID cổng.
 * @param {UpdateGatePayload} payload - Payload cập nhật cổng.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<GateResponse>>>} Response chứa thông tin cổng sau cập nhật.
 */
export const updateGate = (gateId, payload) => {
	return instance.put(`${URL_BACKEND}/gates/${gateId}`, payload)
}

/**
 * Xóa cổng theo ID.
 *	Đúng về path
 * @param {number} gateId - ID cổng.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn với `data = null`.
 */
export const deleteGate = (gateId) => {
	return instance.delete(`${URL_BACKEND}/gates/${gateId}`)
}

/**
 * Tạo mới vị trí đỗ xe.
 *	Đúng về path
 * @param {CreateParkingSlotPayload} payload - Payload tạo vị trí đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotSlotResponse>>>} Response chứa vị trí đỗ vừa tạo.
 */
export const createParkingSlot = (payload) => {
	return instance.post(`${URL_BACKEND}/parking-slots`, payload)
}

/**
 * Lấy thông tin vị trí đỗ theo ID.
 *	Đúng về path
 * @param {number} slotId - ID vị trí đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<ParkingLotSlotResponse>>>} Response chứa thông tin vị trí đỗ.
 */	
export const getParkingSlotById = (slotId) => {
	return instance.get(`${URL_BACKEND}/parking-slots/${slotId}`)
}

/**
 * Thay đổi thiết bị IoT gắn với vị trí đỗ.
 *	Đúng về path
 * @param {number} slotId - ID vị trí đỗ.
 * @param {ChangeSlotDevicePayload} payload - Payload đổi thiết bị.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn với `data = null`.
 */
export const updateParkingSlotDevice = (slotId, payload) => {
	return instance.put(`${URL_BACKEND}/parking-slots/${slotId}/device`, payload)
}

/**
 * Quản trị viên hoặc quản lý cập nhật trạng thái vị trí đỗ.
 *	Đúng về path
 * @param {number} slotId - ID vị trí đỗ.
 * @param {UpdateSlotStatusPayload} payload - Payload cập nhật trạng thái.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<UpdateSlotStatusResponse>>>} Response chứa kết quả cập nhật trạng thái.
 */
export const updateParkingSlotStatus = (slotId, payload) => {
	return instance.patch(`${URL_BACKEND}/parking-slots/admin/${slotId}`, payload)
}

/**
 * Thiết bị cảm biến cập nhật trạng thái vị trí đỗ.
 *	Còn sai về path
 * @param {SensorUpdateSlotStatusPayload} payload - Payload trạng thái từ thiết bị.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<UpdateSlotStatusResponse>>>} Response chứa kết quả cập nhật trạng thái.
 */
export const sensorUpdateSlotStatus = (payload) => {
	return instance.patch(`${URL_BACKEND}/parking-slots/sensor`, payload)
}

/**
 * Lấy lịch sử hoạt động của một vị trí đỗ.
 *	Đúng về path
 * @param {number} slotId - ID vị trí đỗ.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<SlotHistoryResponse[]>>>} Response chứa danh sách lịch sử.
 */
export const getSlotHistory = (slotId) => {
	return instance.get(`${URL_BACKEND}/slots-histories/${slotId}`)
}


const mapService = {
	getParkingLots,
	getParkingLotById,
	createParkingLot,
	updateParkingLot,
	getParkingLotGates,
	createGate,
	getGateById,
	updateGate,
	deleteGate,
	createParkingSlot,
	getParkingSlotById,
	updateParkingSlotDevice,
	updateParkingSlotStatus,
	sensorUpdateSlotStatus,
	getSlotHistory,
}

export default mapService