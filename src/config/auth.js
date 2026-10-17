export const AUTH_STORAGE_KEY = 'mapmate.auth';
export const DEFAULT_REDIRECT_AFTER_LOGIN = '/profile';

// Khớp USER_ROLES ở backend (src/constants/business.js). Khách: không email, không dùng AI, không đăng ký doanh nghiệp
export const GUEST_ROLE = 'guest';

// Khớp với validator backend (src/middlewares/validators/auth.validator.js)
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_CHECK_DEBOUNCE_MS = 450;
