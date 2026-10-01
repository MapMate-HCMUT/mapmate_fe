import {
  compactErrors,
  mapServerFieldErrors,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../../utils/validators';
import { PASSWORD_MIN_LENGTH } from '../../../config/auth';

// Kiểm tra phía client để báo lỗi ngay — backend vẫn validate lại lần nữa.
export const validateLoginForm = ({ email, password }) =>
  compactErrors({ email: validateEmail(email), password: password ? undefined : 'Vui lòng nhập mật khẩu' });

export const validateRegisterForm = ({ username, email, password, confirmPassword }) =>
  compactErrors({
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: confirmPassword === password ? undefined : 'Mật khẩu nhập lại không khớp',
  });

export const mapServerErrors = (error) =>
  mapServerFieldErrors(error, { EMAIL_TAKEN: 'email', USERNAME_TAKEN: 'username' });

// 0-4: độ mạnh mật khẩu để hiển thị thanh gợi ý
export const getPasswordStrength = (password) =>
  [password.length >= PASSWORD_MIN_LENGTH, /[A-Za-z]/.test(password) && /\d/.test(password), /[A-Z]/.test(password), /[^A-Za-z0-9]/.test(password)]
    .filter(Boolean).length;
