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

// ========== Parking Lot API ==========
export const getParkingLots = () => {
  const URL_BACKEND = '/api/v1/parking-lots';
  return axios.get(URL_BACKEND);
}

export const getParkingLotDetail = (id: number) => {
  const URL_BACKEND = `/api/v1/parking-lots/${id}`;
  return axios.get(URL_BACKEND);
}

// ========== Parking Slot API ==========
export const adminUpdateParkingSlot = async (id: number, status: string) => {
  const URL_BACKEND = `/api/v1/parking-slots/admin/${id}`;
  const data = { status };
  return axios.patch(URL_BACKEND, data);
}

// ========== RFID Card API ==========
export const getMyRfidCard = () => {
  const URL_BACKEND = '/api/v1/rfid-cards/my-cards';
  return axios.get(URL_BACKEND);
}

// ========== Parking Session API ==========
export const getMyParkingSessions = (date: string, page: number, pageSize: number) => {
  const URL_BACKEND = '/api/v1/parking-sessions/my-sessions';
  return axios.get(URL_BACKEND, { params: { date, page, pageSize } });
}

export const getAllParkingSessions = (date: string, page: number, pageSize: number) => {
  const URL_BACKEND = '/api/v1/parking-sessions';
  return axios.get(URL_BACKEND, { params: { date, page, pageSize } });
}

// ========== Dashboard API ==========
export const getDashBoard = (date: string, lotId: number) => {
  const URL_BACKEND = '/api/v1/dashboard/parking-flow';
  return axios.get(URL_BACKEND, { params: { date, lotId } });
}