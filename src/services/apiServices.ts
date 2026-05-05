import axios from '../utils/axiosCustomize';

// ========== Auth API ==========

export const register = (email: string, password: string, first_name: string, last_name: string) => {
  const URL_BACKEND = '/api/v1/auth/register';
  const data = { email, password, first_name, last_name };
  return axios.post(URL_BACKEND, data);
};

export const login = (email: string, password: string) => {
  const URL_BACKEND = '/api/v1/auth/login';
  const data = { email, password };
  return axios.post(URL_BACKEND, data, { withCredentials: true });
};

export const logout = () => {
  const URL_BACKEND = '/api/v1/auth/logout';
  return axios.post(URL_BACKEND, {}, { withCredentials: true });
};

export const sendResetPassword = (email: string) => {
  const URL_BACKEND = '/api/v1/auth/send-reset-password';
  const data = { email };
  return axios.post(URL_BACKEND, data);
};

export const resetPassword = (email: string, code: string, new_password: string, confirm_password: string) => {
  const URL_BACKEND = '/api/v1/auth/reset-password';
  const data = { email, code, new_password, confirm_password };
  return axios.patch(URL_BACKEND, data);
};

export const resendVerificationEmail = (email: string) => {
  const URL_BACKEND = '/api/v1/auth/resend';
  const data = { email };
  return axios.post(URL_BACKEND, data);
}

// ========== User API ==========
export const changePassword = (old_password: string, new_password: string, confirm_password: string) => {
  const URL_BACKEND = '/api/v1/users/change-password';
  const data = { old_password, new_password, confirm_password };
  return axios.patch(URL_BACKEND, data);
};

export const getMyProfile = () => {
  const URL_BACKEND = '/api/v1/users/my-info';
  return axios.get(URL_BACKEND);
}

export const updateMyProfile = (first_name: string, last_name: string) => {
  const URL_BACKEND = '/api/v1/users/change-profile';
  const data = { first_name, last_name };
  return axios.patch(URL_BACKEND, data);
}

export const getUserWithPaginate = (page: number, pageSize: number, search: string) => {
  const URL_BACKEND = '/api/v1/users';
  return axios.get(URL_BACKEND, { params: { page, pageSize, search } });
}

export const createUserForAdmin = (email: string, password: string, first_name: string, last_name: string, role: string) => {
  const URL_BACKEND = '/api/v1/users/admin/create';
  const data = { email, password, first_name, last_name, role };
  return axios.post(URL_BACKEND, data);
}

export const changeRoleUserForAdmin = (id: number, newRole: string) => {
  const URL_BACKEND = `/api/v1/users/change-role/${id}`;
  const data = { new_role: newRole };
  return axios.patch(URL_BACKEND, data);
}

// Admin - Find user by email
export const findUserByEmail = (email: string) => {
  const URL_BACKEND = 'api/v1/rfid-cards/user-email';
  return axios.get(URL_BACKEND, { params: { email } });
}

// ========== Parking Lot API ==========
export const getParkingLots = () => {
  const URL_BACKEND = '/api/v1/parking-lots';
  return axios.get(URL_BACKEND);
}

export const getParkingLotDetail = (id: number) => {
  const URL_BACKEND = `/api/v1/parking-lots/${id}`;
  return axios.get(URL_BACKEND);
}

// Alias for ManageLot module
export const getAllLot = () => {
  const URL_BACKEND = '/api/v1/parking-lots';
  return axios.get(URL_BACKEND);
}

export const getLotDetail = (id: number) => {
  const URL_BACKEND = `/api/v1/parking-lots/${id}`;
  return axios.get(URL_BACKEND);
}

export const createLotForAdmin = (name: string, location: string) => {
  const URL_BACKEND = '/api/v1/parking-lots';
  const data = { name, location };
  return axios.post(URL_BACKEND, data);
}

export const createSlotForAdmin = (lot_id: number, name: string, device_mac: string, port_number: number ) => {
  const URL_BACKEND = '/api/v1/parking-slots';
  const data = { name, lot_id, device_mac, port_number};
  return axios.post(URL_BACKEND, data);
}

// ========== Parking Slot API ==========
export const adminUpdateParkingSlot = async (
  id: number,
  status: string,
) => {
  const URL_BACKEND = `/api/v1/parking-slots/admin/${id}`;
  const data = { status };
  return axios.patch(URL_BACKEND, data);
}

export const changeDeviceMacForSlot = async (id: number, device_mac: string, port_number: number) => {
  const URL_BACKEND = `/api/v1/parking-slots/${id}/device`;
  const data = { device_mac, port_number };
  return axios.patch(URL_BACKEND, data);
}

// ========== RFID Card API ==========
export const getMyRfidCard = () => {
  const URL_BACKEND = '/api/v1/rfid-cards/my-cards';
  return axios.get(URL_BACKEND);
}

// Admin - Summary counters
export const getNumberCard = () => {
  const URL_BACKEND = '/api/v1/rfid-cards/statistics';
  return axios.get(URL_BACKEND);
}

// Admin - List cards with optional filters
export const getCard = (status: string, page: number, pageSize: number, keyword: string) => {
  const URL_BACKEND = '/api/v1/rfid-cards';
  return axios.get(URL_BACKEND, { params: { status, page, pageSize, keyword } });
}

// Admin - Add new card
export const addCard = (data: {
  uid: string;
  card_type: 'REGISTERED' | 'GUEST';
  user_id?: number | null;
}) => {
  const URL_BACKEND = '/api/v1/rfid-cards';
  return axios.post(URL_BACKEND, data);
}

// Admin - Update card
export const updateCard = (id: number, data: {
  user_id?: number | null;
  card_type: "REGISTERED" | "GUEST";
  is_active?: boolean;
}) => {
  const URL_BACKEND = `/api/v1/rfid-cards/${id}`;
  return axios.patch(URL_BACKEND, data);
}

// ========== Parking Session API ==========
export const getMyParkingSessions = (date: string, page: number, pageSize: number) => {
  const URL_BACKEND = '/api/v1/parking-sessions/my-sessions';
  return axios.get(URL_BACKEND, { params: { date, page, pageSize } });
}

export const getAllParkingSessions = (date: string, page: number, pageSize: number, search: string) => {
  const URL_BACKEND = '/api/v1/parking-sessions';
  return axios.get(URL_BACKEND, { params: { date, page, pageSize, search } });
}

// ========== Dashboard API ==========
export const getDashBoard = (date: string, lotId: number) => {
  const URL_BACKEND = '/api/v1/dashboard/parking-flow';
  return axios.get(URL_BACKEND, { params: { date, lotId } });
}
