const OUTPUT_QUALITY = 0.85;

// Đọc file ảnh thành <img> đã load xong (kèm objectUrl để hiển thị trong khung cắt).
export const loadImageFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không đọc được file ảnh'));
    };
    image.src = objectUrl;
  });

/**
 * Cắt vùng vuông { x, y, size } (toạ độ pixel gốc của ảnh) rồi thu về outputSize×outputSize px.
 * Xuất WEBP (hoặc JPEG nếu trình duyệt không hỗ trợ) — thường chỉ 15–40KB.
 */
export const cropImageToDataUrl = (image, { x, y, size }, outputSize) => {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, size, size, 0, 0, outputSize, outputSize);

  const webp = canvas.toDataURL('image/webp', OUTPUT_QUALITY);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', OUTPUT_QUALITY);
};
