import instance from '../utils/axiosInterceptor';
const URL_BACKEND = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`

/**
 * Get current user's parking sessions
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise} - Response with pagination data
 */
export const getMyParkingSessions = (date, page, pageSize) => {
  return instance.get(`${URL_BACKEND}/parking-sessions/my-sessions`, { 
    params: { date, page, pageSize } 
  });
}

/**
 * Get all parking sessions (admin only)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @param {string} search - Search keyword (plate number, card UID, etc)
 * @returns {Promise} - Response with pagination data
 */
export const getAllParkingSessions = (date, page, pageSize, search = '') => {
  return instance.get(`${URL_BACKEND}/parking-sessions`, { 
    params: { date, page, pageSize, search } 
  });
}
