import { API_BASE_URL } from '../config/api';

// avatar_url do backend tạo có dạng "/api/users/<id>/avatar?v=..." (đường dẫn tương đối).
// Khi frontend và backend khác domain (VITE_API_BASE_URL = https://api...), ghép đúng domain backend.
export const resolveAssetUrl = (url) => {
  if (!url || !url.startsWith('/api/') || !/^https?:\/\//.test(API_BASE_URL)) return url;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
};
