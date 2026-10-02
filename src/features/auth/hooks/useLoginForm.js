import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { loginApi } from '../api/authApi';
import { useRememberMeStore } from '../stores/rememberMeStore';
import { mapServerErrors, validateLoginForm } from '../utils/validateAuthForm';
import { useAuthRedirect } from './useAuthRedirect';

export const useLoginForm = () => {
  const { remember: savedRemember, email: savedEmail, saveRememberMe } = useRememberMeStore();
  const setSession = useAuthStore((state) => state.setSession);
  const { showToast } = useToast();
  const { redirectTo, goToRedirect } = useAuthRedirect();

  const [values, setValues] = useState({ email: savedEmail, password: '' });
  const [remember, setRemember] = useState(savedRemember);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const clientErrors = validateLoginForm(values);
    setErrors(clientErrors);
    setFormError('');
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const session = await loginApi({ email: values.email.trim(), password: values.password });
      setSession(session, remember);
      saveRememberMe({ remember, email: values.email.trim() });
      showToast(`Chào mừng trở lại, ${session.user.username}!`);
      goToRedirect();
    } catch (error) {
      setErrors(mapServerErrors(error));
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, formError, remember, setRemember, isSubmitting, handleChange, handleSubmit, redirectTo };
};
