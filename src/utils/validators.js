import { PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../config/auth';

// Luật validate dùng chung (khớp backend) — trả về chuỗi lỗi hoặc undefined.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

export const validateEmail = (email) => (EMAIL_PATTERN.test(email.trim()) ? undefined : 'Email không hợp lệ');

// Quy định username — khớp backend (auth.validator.js). Hiển thị dưới ô nhập cho người dùng biết.
export const USERNAME_RULES = [
  `${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} ký tự, bắt đầu bằng chữ cái`,
  'Chỉ chữ cái không dấu, số, dấu "." hoặc "_"',
  'Không kết thúc bằng "." / "_", không dùng 2 dấu liền nhau',
];

export const validateUsername = (username) => {
  const name = username.trim();
  if (name.length < USERNAME_MIN_LENGTH) return `Tên người dùng tối thiểu ${USERNAME_MIN_LENGTH} ký tự`;
  if (name.length > USERNAME_MAX_LENGTH) return `Tên người dùng tối đa ${USERNAME_MAX_LENGTH} ký tự`;
  if (!/^[A-Za-z0-9._]+$/.test(name)) return 'Chỉ dùng chữ cái không dấu, số, dấu "." hoặc "_"';
  if (!/^[A-Za-z]/.test(name)) return 'Phải bắt đầu bằng chữ cái';
  if (!/[A-Za-z0-9]$/.test(name)) return 'Không được kết thúc bằng "." hoặc "_"';
  if (/[._]{2}/.test(name)) return 'Không dùng 2 dấu "." hoặc "_" liền nhau';
  return undefined;
};

export const validatePassword = (password) => {
  if (password.length < PASSWORD_MIN_LENGTH) return `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Mật khẩu cần có cả chữ và số';
  return undefined;
};

export const validateImageUrl = (url) => (!url.trim() || URL_PATTERN.test(url.trim()) ? undefined : 'Link ảnh phải bắt đầu bằng http:// hoặc https://');

// Bỏ các key có giá trị undefined => { field: message } chỉ gồm lỗi thật.
export const compactErrors = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));

// Đưa lỗi từng trường từ backend (details[]) vào đúng ô input.
export const mapServerFieldErrors = (error, extra = {}) => ({
  ...Object.fromEntries((error.details ?? []).map(({ field, message }) => [field, message])),
  ...(extra[error.errorCode] && { [extra[error.errorCode]]: error.message }),
});
