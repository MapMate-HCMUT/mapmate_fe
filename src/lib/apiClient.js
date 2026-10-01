import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, SESSION_ERROR_CODES } from '../config/api';
import { useAuthStore } from '../stores/authStore';

const GATEWAY_ERROR_STATUSES = [502, 503, 504];

// Axios dùng chung: tự gắn Bearer token, tự đăng xuất khi token hết hạn, chuẩn hóa lỗi.
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT_MS });

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const body = error.response?.data;
    if (SESSION_ERROR_CODES.includes(body?.errorCode)) useAuthStore.getState().clearSession();

    // Không có response, hoặc 502/503/504 từ proxy => backend chưa chạy / không truy cập được.
    const isUnreachable = !error.response || GATEWAY_ERROR_STATUSES.includes(error.response.status);
    const message = body?.message
      ?? (isUnreachable
        ? 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa (cd backend && npm run dev)'
        : 'Máy chủ gặp sự cố, vui lòng thử lại sau');
    return Promise.reject(Object.assign(new Error(message), { errorCode: body?.errorCode, details: body?.details ?? [] }));
  },
);
