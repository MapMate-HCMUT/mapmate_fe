import { useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useToast } from '../../../hooks/useToast';
import { useUsernameCheck } from '../../../hooks/useUsernameCheck';
import { useAuthStore } from '../../../stores/authStore';
import { mapServerFieldErrors, validateUsername } from '../../../utils/validators';
import { updateMyProfileApi } from '../api/gamificationApi';

// Đổi username: kiểm tra luật + trùng tên khi gõ; server giới hạn 1 lần / 14 ngày.
export const useEditProfile = (profile, onSaved) => {
  const modal = useDisclosure();
  const updateUser = useAuthStore((state) => state.updateUser);
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usernameCheck = useUsernameCheck(username, profile?.username);
  const lockedUntil = profile?.username_change_available_at ? new Date(profile.username_change_available_at) : null;

  const openEditor = () => {
    setUsername(profile.username);
    setErrors({});
    modal.open();
  };

  const handleChange = (value) => {
    setUsername(value);
    setErrors({});
  };

  const handleSubmit = async () => {
    const name = username.trim();
    if (name === profile.username) return modal.close();
    const ruleError = validateUsername(name) ?? (usernameCheck.status === 'taken' ? usernameCheck.message : undefined);
    if (ruleError) return setErrors({ username: ruleError });

    setIsSubmitting(true);
    try {
      const { profile: updated } = await updateMyProfileApi({ username: name });
      updateUser(updated);
      showToast('Đã đổi tên người dùng');
      modal.close();
      onSaved();
    } catch (error) {
      const fieldErrors = mapServerFieldErrors(error, { USERNAME_TAKEN: 'username' });
      setErrors(fieldErrors.username ? fieldErrors : { form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { modal, openEditor, username, errors, isSubmitting, usernameCheck, lockedUntil, handleChange, handleSubmit };
};
