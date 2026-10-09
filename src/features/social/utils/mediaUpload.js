// Tải 1 file THẲNG lên Cloudinary bằng chữ ký server vừa cấp (file không đi qua server MapMate).
// Dùng XMLHttpRequest để có % tiến độ (fetch chưa báo tiến độ tải lên).
const UPLOAD_FIELDS = ['api_key', 'timestamp', 'signature', 'public_id', 'asset_folder', 'allowed_formats', 'eager', 'eager_async']; // eager*: chỉ có với video

export const uploadToCloudinary = (file, signed, onProgress) =>
  new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    UPLOAD_FIELDS.filter((field) => signed[field] != null).forEach((field) => form.append(field, signed[field]));
    const request = new XMLHttpRequest();
    request.open('POST', signed.upload_url);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        const body = JSON.parse(request.responseText);
        resolve({ public_id: body.public_id, resource_type: signed.resource_type });
      } else reject(new Error('Tải lên không thành công — file có thể sai định dạng, bạn thử file khác nhé'));
    };
    request.onerror = () => reject(new Error('Mất kết nối khi tải lên — kiểm tra mạng rồi thử lại nhé'));
    request.send(form);
  });

// Thời lượng video (giây) đọc ngay trên máy người dùng, trước khi tải lên
export const readVideoDuration = (url) =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => resolve(null);
    video.src = url;
  });

export const mediaKindOf = (file) => (file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null);
export const formatMegabytes = (bytes) => `${Math.round(bytes / 1024 / 1024)}MB`;
