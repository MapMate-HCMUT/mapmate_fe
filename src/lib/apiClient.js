import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, SESSION_ERROR_CODES } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import { classifyHttpError, ERROR_KINDS, shortMessageFor } from '../utils/errorMessages';

// Lời nhắn backend tự viết cho người dùng (4xx) thì giữ; lỗi kỹ thuật (mất mạng, 5xx, sai đường dẫn API) => lời nhắn dễ hiểu
const USER_FACING_KINDS = [ERROR_KINDS.REQUEST, ERROR_KINDS.RATE_LIMIT, ERROR_KINDS.NOT_FOUND];
const TECHNICAL_ERROR_CODES = ['ROUTE_NOT_FOUND'];

// Axios dùng chung: tự gắn Bearer token, tự đăng xuất khi token hết hạn, chuẩn hóa lỗi (error.kind + lời nhắn dễ hiểu).
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

    const kind = classifyHttpError(error);
    const isUserFacing = USER_FACING_KINDS.includes(kind) && body?.message && !TECHNICAL_ERROR_CODES.includes(body?.errorCode);
    // Dev: không có response / 502–504 từ proxy thường là backend chưa chạy (cd backend && npm run dev)
    if (import.meta.env.DEV && kind === ERROR_KINDS.SERVER) console.warn('[api]', error.config?.url, error.response?.status ?? error.code ?? error.message);
    const message = isUserFacing ? body.message : shortMessageFor(kind);
    return Promise.reject(Object.assign(new Error(message), { kind, status: error.response?.status ?? null, errorCode: body?.errorCode, details: body?.details ?? [] }));
  },
);
