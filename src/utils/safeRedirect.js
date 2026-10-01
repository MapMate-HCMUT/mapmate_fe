import { DEFAULT_REDIRECT_AFTER_LOGIN } from '../config/auth';

// Chỉ chấp nhận đường dẫn nội bộ ("/profile?tab=x"), chặn "//evil.com" hay "https://..." (open redirect).
export const getSafeRedirect = (value) =>
  value?.startsWith('/') && !value.startsWith('//') ? value : DEFAULT_REDIRECT_AFTER_LOGIN;
