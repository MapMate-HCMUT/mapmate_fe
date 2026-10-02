import { useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useToast } from '../../../hooks/useToast';
import { compactErrors, mapServerFieldErrors, validatePassword } from '../../../utils/validators';
import { changePasswordApi } from '../api/gamificationApi';

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };
const SERVER_FIELD_MAP = { current_password: 'currentPassword', new_password: 'newPassword' };

export const useChangePassword = () => {
  const modal = useDisclosure();
  const { showToast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = () => {
    setValues(EMPTY_FORM);
    setErrors({});
    modal.open();
  };

  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const clientErrors = compactErrors({
      currentPassword: values.currentPassword ? undefined : 'Vui lòng nhập mật khẩu hiện tại',
      newPassword: validatePassword(values.newPassword),
      confirmPassword: values.confirmPassword === values.newPassword ? undefined : 'Mật khẩu nhập lại không khớp',
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await changePasswordApi(values);
      showToast('Đổi mật khẩu thành công');
      modal.close();
    } catch (error) {
      const serverErrors = mapServerFieldErrors(error);
      const mapped = Object.fromEntries(Object.entries(serverErrors).map(([field, message]) => [SERVER_FIELD_MAP[field] ?? field, message]));
      setErrors({ ...mapped, form: Object.keys(mapped).length ? undefined : error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { modal, openDialog, values, errors, isSubmitting, handleChange, handleSubmit };
};
