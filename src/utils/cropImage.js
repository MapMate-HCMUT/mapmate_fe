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
 * Cắt vùng { x, y, width, height } (toạ độ pixel gốc của ảnh) rồi thu về kích thước `output`
 * (số = vuông output×output, hoặc { width, height }). Xuất WEBP (hoặc JPEG nếu trình duyệt không hỗ trợ).
 */
export const cropImageToDataUrl = (image, { x, y, width, height }, output) => {
  const canvas = document.createElement('canvas');
  canvas.width = typeof output === 'number' ? output : output.width;
  canvas.height = typeof output === 'number' ? output : output.height;
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL('image/webp', OUTPUT_QUALITY);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', OUTPUT_QUALITY);
};
