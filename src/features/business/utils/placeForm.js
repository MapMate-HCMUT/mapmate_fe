// Dữ liệu form cửa hàng <-> dữ liệu gửi API (backend: middlewares/validators/business.validator.js)
import { parsePhone, phoneProblem } from '../../../utils/phone';
import { FULL_DAY, weekOf, weekProblems } from '../../../utils/weeklyHours';

const DEFAULT_HOURS = { open: '07:00', close: '22:00' };

export const emptyPlaceForm = () => ({
  name: '',
  category: 'cafe',
  phone: '',
  description: '',
  specialties: '',
  weekly: weekOf([DEFAULT_HOURS]), // null = chưa công khai giờ
  price_min: '',
  price_max: '',
  coordinates: null,
  address: '',
  district: null,
});

// Cửa hàng đang có (GET /api/businesses/me) -> form sửa
export const placeToForm = (place) => ({
  name: place.name,
  category: place.category,
  phone: place.contact?.phone ?? '',
  description: place.description ?? '',
  specialties: (place.specialties ?? []).join(', '),
  // Cửa hàng cũ chỉ có 1 khung giờ chung => trải ra cả tuần cho chủ quán sửa từng ngày
  weekly: place.weekly_hours ?? (place.hours_known === false ? null : weekOf([place.opening_hours ?? FULL_DAY])),
  price_min: String(place.price_range?.min ?? ''),
  price_max: String(place.price_range?.max ?? ''),
  coordinates: place.coordinates,
  address: place.address ?? '',
  district: place.district ?? null,
});

const toNumber = (value) => Number(String(value).replace(/\D/g, ''));

/** Lỗi theo từng ô (rỗng = hợp lệ). step: chỉ kiểm tra các ô của 1 bước khi đăng ký nhiều bước */
export const validatePlaceForm = (values, fields = null) => {
  const errors = {};
  const check = (field, problem) => (!fields || fields.includes(field)) && problem && (errors[field] = problem);
  check('name', values.name.trim().length < 2 && 'Nhập tên cửa hàng (ít nhất 2 ký tự)');
  const phone = parsePhone(values.phone);
  check('phone', phoneProblem(phone.country, phone.national));
  const hourProblems = values.weekly ? weekProblems(values.weekly) : {};
  check('weekly', Object.keys(hourProblems).length > 0 && hourProblems);
  check('price_min', (values.price_min === '' || values.price_max === '') && 'Nhập khoảng giá (0 nếu miễn phí)');
  check('price_max', values.price_min !== '' && values.price_max !== '' && toNumber(values.price_max) < toNumber(values.price_min) && 'Giá cao nhất phải ≥ giá thấp nhất');
  check('coordinates', !values.coordinates && 'Chọn vị trí cửa hàng trên bản đồ');
  check('address', values.address.trim().length < 5 && 'Nhập địa chỉ cửa hàng');
  return errors;
};

export const formToPlacePayload = (values) => ({
  name: values.name.trim(),
  category: values.category,
  phone: values.phone || null, // đã là E.164 ("+84901234567") từ PhoneField
  description: values.description.trim() || null,
  specialties: values.specialties.split(',').map((item) => item.trim()).filter(Boolean),
  weekly_hours: values.weekly,
  price_range: { min: toNumber(values.price_min), max: toNumber(values.price_max) },
  coordinates: values.coordinates,
  address: values.address.trim(),
  district: values.district,
});
