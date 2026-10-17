// Các loại lỗi người dùng báo được cho 1 địa điểm (khớp PLACE_REPORT_TYPES của server). Báo cáo chỉ để MapMate kiểm tra.
export const PLACE_REPORT_NOTE_MAX_LENGTH = 500;
export const REPORT_ISSUES = [
  { value: 'closed', label: 'Đã đóng cửa', hint: 'Quán ngưng hoạt động / chuyển đi nơi khác' },
  { value: 'wrong_hours', label: 'Sai giờ mở cửa', hint: 'VD: thực tế mở 7:00 – 22:00' },
  { value: 'wrong_price', label: 'Sai giá', hint: 'VD: món rẻ nhất khoảng 35k' },
  { value: 'wrong_location', label: 'Sai địa chỉ / vị trí', hint: 'Ghim trên bản đồ hoặc địa chỉ không đúng' },
  { value: 'other', label: 'Lỗi khác', hint: 'Mô tả giúp MapMate lỗi bạn gặp', noteRequired: true },
];
export const REPORT_LABELS = { ...Object.fromEntries(REPORT_ISSUES.map((issue) => [issue.value, issue.label.toLowerCase()])), open: 'vẫn mở cửa' };
