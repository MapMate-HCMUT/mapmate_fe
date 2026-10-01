const CLOCK_SKEW_MS = 30 * 1000;

// Đọc payload JWT (không xác thực chữ ký — việc đó do backend làm) để biết token hết hạn chưa.
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 <= Date.now() + CLOCK_SKEW_MS;
  } catch {
    return true;
  }
};
