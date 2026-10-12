// Số điện thoại: lưu dạng quốc tế E.164 ("+84901234567"), hiển thị theo nhóm số của từng nước ("+84 90 123 4567").
// Khớp chuẩn hoá ở backend (middlewares/validators/business.validator.js — normalizePhone).
export const PHONE_COUNTRIES = [
  { code: 'VN', name: 'Việt Nam', dial: '84', flag: '🇻🇳', placeholder: '90 123 4567' },
  { code: 'US', name: 'Hoa Kỳ / Canada', dial: '1', flag: '🇺🇸', placeholder: '201 555 0123', groups: [3, 3, 4], length: [10, 10] },
  { code: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬', placeholder: '8123 4567', groups: [4, 4], length: [8, 8] },
  { code: 'TH', name: 'Thái Lan', dial: '66', flag: '🇹🇭', placeholder: '81 234 5678', groups: [2, 3, 4], length: [8, 9] },
  { code: 'KR', name: 'Hàn Quốc', dial: '82', flag: '🇰🇷', placeholder: '10 1234 5678', groups: [2, 4, 4], length: [9, 10] },
  { code: 'JP', name: 'Nhật Bản', dial: '81', flag: '🇯🇵', placeholder: '90 1234 5678', groups: [2, 4, 4], length: [9, 10] },
  { code: 'CN', name: 'Trung Quốc', dial: '86', flag: '🇨🇳', placeholder: '131 2345 6789', groups: [3, 4, 4], length: [11, 11] },
  { code: 'AU', name: 'Úc', dial: '61', flag: '🇦🇺', placeholder: '412 345 678', groups: [3, 3, 3], length: [9, 9] },
  { code: 'FR', name: 'Pháp', dial: '33', flag: '🇫🇷', placeholder: '6 12 34 56 78', groups: [1, 2, 2, 2, 2], length: [9, 9] },
];
export const DEFAULT_COUNTRY = PHONE_COUNTRIES[0];
const byDialLength = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export const countryByCode = (code) => PHONE_COUNTRIES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
export const onlyDigits = (value) => value.replace(/\D/g, '');

// Việt Nam: di động 9 số (đầu 3/5/7/8/9) "90 123 4567"; cố định 10 số (đầu 2) "28 3822 1234"
const vnGroups = (digits) => (digits.startsWith('2') ? [2, 4, 4] : [2, 3, 4]);
const groupsOf = (country, digits) => (country.code === 'VN' ? vnGroups(digits) : country.groups);

/** Chia số quốc nội thành nhóm khi đang gõ: "901234567" => "90 123 4567" */
export const formatNational = (country, digits) => {
  const parts = [];
  let rest = digits;
  for (const size of groupsOf(country, digits)) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return [...parts, rest].filter(Boolean).join(' ');
};

/** "+84901234567" / "0901234567" (dữ liệu cũ) => { country, national: "901234567" } */
export const parsePhone = (value) => {
  if (!value) return { country: DEFAULT_COUNTRY, national: '' };
  const digits = onlyDigits(value);
  if (!value.trim().startsWith('+')) return { country: DEFAULT_COUNTRY, national: digits.replace(/^0/, '') };
  const country = byDialLength.find((item) => digits.startsWith(item.dial));
  return country ? { country, national: digits.slice(country.dial.length) } : { country: DEFAULT_COUNTRY, national: digits };
};

export const toE164 = (country, national) => (national ? `+${country.dial}${onlyDigits(national).replace(/^0/, '')}` : '');

/** Lời nhắc lỗi, hoặc '' nếu hợp lệ / để trống */
export const phoneProblem = (country, national) => {
  const digits = onlyDigits(national).replace(/^0/, '');
  if (!digits) return '';
  if (country.code === 'VN') {
    if (/^[35789]\d{8}$/.test(digits) || /^2\d{9}$/.test(digits)) return '';
    return digits.startsWith('2') ? 'Số cố định Việt Nam gồm 10 số sau +84 (VD 28 3822 1234)' : 'Số di động Việt Nam gồm 9 số sau +84 (VD 90 123 4567)';
  }
  const [min, max] = country.length;
  return digits.length >= min && digits.length <= max ? '' : `Số của ${country.name} gồm ${min === max ? min : `${min}–${max}`} chữ số`;
};

/** Hiển thị: "+84 90 123 4567"; chuỗi lạ (dữ liệu nguồn mở) giữ nguyên */
export const formatPhoneDisplay = (value) => {
  if (!value) return '';
  if (/[;,/]/.test(value) || onlyDigits(value).length > 15) return value; // nhiều số trong 1 ô (dữ liệu nguồn mở)
  const { country, national } = parsePhone(value);
  return national ? `+${country.dial} ${formatNational(country, national)}` : value;
};
