import { useEffect, useState } from 'react';
import { USERNAME_CHECK_DEBOUNCE_MS } from '../config/auth';
import { apiClient } from '../lib/apiClient';
import { validateUsername } from '../utils/validators';

/**
 * Kiểm tra username khi đang gõ: luật định dạng chạy ngay, còn trùng tên thì hỏi server sau 450ms ngừng gõ.
 * status: idle | invalid | checking | available | taken
 */
export const useUsernameCheck = (username, currentUsername) => {
  const [result, setResult] = useState({ forName: null, status: 'idle', message: '' });
  const name = username.trim();
  const ruleError = name ? validateUsername(name) : undefined;
  const shouldQuery = Boolean(name) && !ruleError && name.toLowerCase() !== currentUsername?.toLowerCase();

  useEffect(() => {
    if (!shouldQuery) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      apiClient
        .get('/users/check-username', { params: { username: name } })
        .then((data) => isActive && setResult({ forName: name, status: data.available ? 'available' : 'taken', message: data.reason ?? 'Tên này dùng được' }))
        .catch((error) => isActive && setResult({ forName: name, status: 'taken', message: error.message }));
    }, USERNAME_CHECK_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [name, shouldQuery]);

  if (ruleError) return { status: 'invalid', message: ruleError };
  if (!shouldQuery) return { status: 'idle', message: '' };
  // Kết quả server là của tên cũ => đang chờ kiểm tra tên mới
  if (result.forName !== name) return { status: 'checking', message: 'Đang kiểm tra…' };
  return result;
};
