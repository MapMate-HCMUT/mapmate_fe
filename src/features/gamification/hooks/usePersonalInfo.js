import { useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useToast } from '../../../hooks/useToast';
import { compactErrors, mapServerFieldErrors } from '../../../utils/validators';
import { getAreaFromLocationApi, updateMyProfileApi } from '../api/gamificationApi';
import { DEFAULT_COUNTRY, toDateInputValue } from '../utils/profileConfig';

const MIN_AGE = 13;
const GEOLOCATION_TIMEOUT_MS = 10000;
const HOUSE_NUMBER_PATTERN = /^\s*(số\s*(nhà\s*)?)?\d+[a-z]?([/-]\d+[a-z]?)*[\s,]/i;
const AREA_FIELDS = ['street', 'district', 'city', 'country'];

const validate = ({ birthDate, street }) => {
  const minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - MIN_AGE);
  return compactErrors({
    birthDate: birthDate && new Date(birthDate) > minAgeDate ? `Bạn cần ít nhất ${MIN_AGE} tuổi` : undefined,
    street: HOUSE_NUMBER_PATTERN.test(street) ? 'Chỉ nhập tên đường, không nhập số nhà' : undefined,
  });
};

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Trình duyệt không hỗ trợ định vị'));
    return navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => reject(new Error('Bạn chưa cho phép truy cập vị trí')),
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  });

// Ngày sinh + khu vực sinh sống (chỉ đường/quận/thành phố/quốc gia — toạ độ GPS không được lưu).
export const usePersonalInfo = (profile, onSaved) => {
  const modal = useDisclosure();
  const { showToast } = useToast();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const openEditor = () => {
    const area = profile.home_area ?? {};
    setValues({
      birthDate: toDateInputValue(profile.birth_date),
      ...Object.fromEntries(AREA_FIELDS.map((field) => [field, area[field] ?? ''])),
      country: area.country ?? DEFAULT_COUNTRY,
    });
    setErrors({});
    modal.open();
  };

  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const fillFromLocation = async () => {
    setIsLocating(true);
    try {
      const area = await getAreaFromLocationApi(await getCurrentPosition());
      setValues((prev) => ({ ...prev, ...Object.fromEntries(AREA_FIELDS.map((field) => [field, area[field] ?? prev[field]])) }));
      showToast('Đã điền khu vực từ vị trí hiện tại (không lưu số nhà, không lưu toạ độ)', 'info');
    } catch (locateError) {
      setErrors((prev) => ({ ...prev, form: locateError.message }));
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    const area = Object.fromEntries(AREA_FIELDS.map((field) => [field, values[field].trim() || null]));
    const hasArea = Object.values(area).some(Boolean);
    setIsSubmitting(true);
    try {
      await updateMyProfileApi({ birth_date: values.birthDate || null, home_area: hasArea ? area : null });
      showToast('Đã lưu thông tin cá nhân');
      modal.close();
      onSaved();
    } catch (error) {
      const serverErrors = mapServerFieldErrors(error);
      const mapped = Object.fromEntries(Object.entries(serverErrors).map(([field, message]) => [field.replace('home_area.', '').replace('birth_date', 'birthDate'), message]));
      setErrors({ ...mapped, form: Object.keys(mapped).length ? undefined : error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { modal, openEditor, values, errors, isSubmitting, isLocating, handleChange, handleSubmit, fillFromLocation };
};
