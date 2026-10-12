// Giờ mở cửa theo ngày (khớp backend utils/weeklyHours.js): { mon: [{ open, close }], ..., sun: [] }
// Mảng rỗng = nghỉ; close < open = qua đêm; 00:00–24:00 = mở 24 giờ.
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_LABELS = { mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7', sun: 'Chủ nhật' };
export const DAY_SHORT = { mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN' };
export const MAX_RANGES_PER_DAY = 3;
export const FULL_DAY = { open: '00:00', close: '24:00' };

const pad = (value) => String(value).padStart(2, '0');
// Mốc 15 phút cho ô chọn giờ (dễ chọn trên điện thoại hơn ô nhập giờ của trình duyệt)
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => `${pad(Math.floor(index / 4))}:${pad((index % 4) * 15)}`);
export const CLOSE_OPTIONS = [...TIME_OPTIONS.slice(1), '24:00'];

export const weekOf = (ranges) => Object.fromEntries(DAY_KEYS.map((day) => [day, ranges.map((range) => ({ ...range }))]));
export const isFullDay = (ranges) => ranges.length === 1 && ranges[0].open === '00:00' && ranges[0].close === '24:00';
export const isOvernight = (range) => range.close < range.open;

/** Lỗi theo ngày: { tue: 'Các khung giờ bị chồng nhau' } (rỗng = hợp lệ) */
export const weekProblems = (week) => {
  const problems = {};
  for (const day of DAY_KEYS) {
    const ranges = [...(week[day] ?? [])].sort((a, b) => a.open.localeCompare(b.open));
    if (ranges.some((range) => range.open === range.close)) problems[day] = 'Giờ mở và giờ đóng phải khác nhau';
    else if (ranges.some((range, index) => index < ranges.length - 1 && (isOvernight(range) || range.close > ranges[index + 1].open))) problems[day] = 'Các khung giờ bị chồng nhau (khung qua đêm phải là khung cuối)';
  }
  return problems;
};

export const formatRanges = (ranges) =>
  !ranges?.length ? 'Nghỉ' : isFullDay(ranges) ? 'Mở 24 giờ' : ranges.map((range) => `${range.open}–${range.close === '24:00' ? '24:00' : range.close}`).join(', ');

// Ngày + giờ theo giờ Việt Nam (người xem có thể đang ở múi giờ khác)
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
export const vnDayAndMinutes = (date = new Date()) => {
  const local = new Date(date.getTime() + VN_OFFSET_MS);
  return { day: DAY_KEYS[(local.getUTCDay() + 6) % 7], minutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
};
const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * Trạng thái lúc này cho thẻ địa điểm: { isOpen, text } — "Đang mở · đóng lúc 22:00" / "Đã đóng · mở lúc 07:00 Thứ 3"
 * Tính cả phần sau nửa đêm của khung qua đêm hôm trước.
 */
export const scheduleStatus = (week, date = new Date()) => {
  const { day, minutes } = vnDayAndMinutes(date);
  const index = DAY_KEYS.indexOf(day);
  const yesterday = DAY_KEYS[(index + 6) % 7];
  const spill = (week[yesterday] ?? []).find((range) => isOvernight(range) && minutes < toMinutes(range.close));
  if (spill) return { isOpen: true, text: `Đang mở · đóng lúc ${spill.close}` };
  for (const range of week[day] ?? []) {
    const start = toMinutes(range.open);
    const end = isOvernight(range) ? 24 * 60 + toMinutes(range.close) : toMinutes(range.close);
    if (minutes >= start && minutes < end) return { isOpen: true, text: isFullDay([range]) ? 'Mở 24 giờ hôm nay' : `Đang mở · đóng lúc ${range.close}` };
  }
  // Lần mở kế tiếp: hôm nay (khung sau) hoặc các ngày tới
  const later = (week[day] ?? []).find((range) => toMinutes(range.open) > minutes);
  if (later) return { isOpen: false, text: `Đã đóng · mở lại lúc ${later.open}` };
  for (let offset = 1; offset <= 7; offset += 1) {
    const next = DAY_KEYS[(index + offset) % 7];
    const [first] = week[next] ?? [];
    if (first) return { isOpen: false, text: `Đã đóng · mở lúc ${first.open} ${offset === 1 ? 'ngày mai' : DAY_LABELS[next]}` };
  }
  return { isOpen: false, text: 'Tạm nghỉ cả tuần' };
};
