import { useEffect, useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useImageCropper } from '../../../hooks/useImageCropper';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { cropImageToDataUrl, loadImageFile } from '../../../utils/cropImage';
import { validateImageUrl } from '../../../utils/validators';
import { deleteAvatarApi, updateMyProfileApi, uploadAvatarApi } from '../api/gamificationApi';
import { AVATAR_CROP_VIEWPORT, AVATAR_INPUT_MAX_MB, AVATAR_OUTPUT_SIZE } from '../utils/profileConfig';

const BYTES_PER_MB = 1024 * 1024;
const MODAL_HORIZONTAL_PADDING = 48; // p-6 hai bên của Modal trên mobile

// Khung cắt 320px, nhưng co lại trên màn hình hẹp (VD điện thoại 360px) để không tràn.
const getCropViewportSize = () => Math.min(AVATAR_CROP_VIEWPORT, window.innerWidth - MODAL_HORIZONTAL_PADDING);

/**
 * Đổi ảnh đại diện: tải ảnh từ máy (tự căn chỉnh vùng cắt), chọn avatar có sẵn, dán link, hoặc xoá ảnh.
 * Bước "crop": người dùng kéo / zoom trong khung tròn rồi bấm "Dùng ảnh này".
 */
export const useAvatarEditor = (profile, onSaved) => {
  const modal = useDisclosure();
  const updateUser = useAuthStore((state) => state.updateUser);
  const { showToast } = useToast();
  const [draft, setDraft] = useState({ preview: null, source: null, linkInput: '' });
  const [cropSource, setCropSource] = useState(null); // { image, objectUrl } khi đang căn chỉnh
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [cropViewportSize, setCropViewportSize] = useState(AVATAR_CROP_VIEWPORT);
  const cropper = useImageCropper(cropSource?.image, cropViewportSize);

  // Giải phóng bộ nhớ ảnh tạm khi đổi ảnh khác / đóng
  useEffect(() => () => cropSource && URL.revokeObjectURL(cropSource.objectUrl), [cropSource]);

  const openEditor = () => {
    setDraft({ preview: profile.avatar_url, source: null, linkInput: '' });
    setCropSource(null);
    setError('');
    modal.open();
  };

  const pickFile = async (file) => {
    if (!file) return;
    if (file.size > AVATAR_INPUT_MAX_MB * BYTES_PER_MB) return setError(`Ảnh tối đa ${AVATAR_INPUT_MAX_MB}MB`);
    try {
      setCropViewportSize(getCropViewportSize());
      setCropSource(await loadImageFile(file));
      setError('');
    } catch (readError) {
      setError(readError.message);
    }
  };

  const confirmCrop = () => {
    const dataUrl = cropImageToDataUrl(cropSource.image, cropper.getCropArea(), AVATAR_OUTPUT_SIZE);
    setDraft((prev) => ({ ...prev, preview: dataUrl, source: { type: 'upload', value: dataUrl } }));
    setCropSource(null);
  };

  const cancelCrop = () => setCropSource(null);

  const pickPreset = (url) => setDraft((prev) => ({ ...prev, preview: url, source: { type: 'url', value: url } }));

  const changeLink = (linkInput) => {
    const linkError = validateImageUrl(linkInput);
    setError(linkError ?? '');
    setDraft((prev) => ({ ...prev, linkInput, ...(!linkError && linkInput.trim() && { preview: linkInput.trim(), source: { type: 'url', value: linkInput.trim() } }) }));
  };

  const persist = async (request) => {
    setIsSaving(true);
    try {
      const { profile: updated } = await request();
      updateUser(updated);
      showToast(updated.avatar_url ? 'Đã cập nhật ảnh đại diện' : 'Đã xoá ảnh đại diện');
      modal.close();
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const save = () => {
    if (!draft.source) return modal.close();
    const { type, value } = draft.source;
    return persist(() => (type === 'upload' ? uploadAvatarApi(value) : updateMyProfileApi({ avatar_url: value })));
  };

  return {
    modal, openEditor, draft, error, isSaving, pickFile, pickPreset, changeLink, save,
    remove: () => persist(deleteAvatarApi),
    hasAvatar: Boolean(profile?.avatar_url),
    crop: cropSource && { src: cropSource.objectUrl, viewportSize: cropViewportSize, cropper, confirm: confirmCrop, cancel: cancelCrop },
  };
};
