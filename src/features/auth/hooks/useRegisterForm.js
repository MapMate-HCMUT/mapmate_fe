import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { useUsernameCheck } from '../../../hooks/useUsernameCheck';
import { useAuthStore } from '../../../stores/authStore';
import { registerApi } from '../api/authApi';
import { useRememberMeStore } from '../stores/rememberMeStore';
import { getPasswordStrength, mapServerErrors, validateRegisterForm } from '../utils/validateAuthForm';
import { useAuthRedirect } from './useAuthRedirect';

const EMPTY_FORM = { username: '', email: '', password: '', confirmPassword: '' };

export const useRegisterForm = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const saveRememberMe = useRememberMeStore((state) => state.saveRememberMe);
  const { showToast } = useToast();
  const { redirectTo, goToRedirect } = useAuthRedirect();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usernameCheck = useUsernameCheck(values.username);

  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const clientErrors = validateRegisterForm(values);
    if (!clientErrors.username && usernameCheck.status === 'taken') clientErrors.username = usernameCheck.message;
    setErrors(clientErrors);
    setFormError('');
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const email = values.email.trim();
      const session = await registerApi({ email, password: values.password, username: values.username.trim() });
      // Đăng ký xong đăng nhập luôn và ghi nhớ trên thiết bị này.
      setSession(session, true);
      saveRememberMe({ remember: true, email });
      showToast(`Tạo tài khoản thành công! Chào ${session.user.username} 🎉`);
      goToRedirect();
    } catch (error) {
      setErrors(mapServerErrors(error));
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values, errors, formError, isSubmitting, handleChange, handleSubmit, redirectTo, usernameCheck,
    passwordStrength: getPasswordStrength(values.password),
  };
};
