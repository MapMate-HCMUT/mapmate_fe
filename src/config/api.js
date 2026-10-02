export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_TIMEOUT_MS = 15000;

// Mã lỗi backend báo phiên đăng nhập không còn hợp lệ => tự đăng xuất.
export const SESSION_ERROR_CODES = ['TOKEN_INVALID', 'TOKEN_EXPIRED'];
