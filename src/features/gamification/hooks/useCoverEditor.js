import { useEffect, useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useImageCropper } from '../../../hooks/useImageCropper';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { cropImageToDataUrl, loadImageFile } from '../../../utils/cropImage';
import { deleteCoverApi, uploadCoverApi } from '../api/gamificationApi';
import { COVER_ASPECT, COVER_CROP_MAX_WIDTH, COVER_INPUT_MAX_MB, COVER_OUTPUT } from '../utils/profileConfig';

const BYTES_PER_MB = 1024 * 1024;
const MODAL_HORIZONTAL_PADDING = 48; // p-6 hai bên của Modal trên mobile

// Khung cắt rộng tối đa 560px, co lại trên màn hình hẹp; cao = rộng / 4
const getCropViewport = () => {
  const width = Math.min(COVER_CROP_MAX_WIDTH, window.innerWidth - MODAL_HORIZONTAL_PADDING);
  return { width, height: Math.round(width / COVER_ASPECT) };
};

/**
 * Đổi ảnh bìa hồ sơ: chọn ảnh từ máy → kéo / zoom trong khung 4:1 → lưu; hoặc xoá để về dải màu mặc định.
 */
export const useCoverEditor = (profile, onSaved) => {
  const modal = useDisclosure();
  const updateUser = useAuthStore((state) => state.updateUser);
  const { showToast } = useToast();
  const [cropSource, setCropSource] = useState(null); // { image, objectUrl } khi đang căn chỉnh
  const [viewport, setViewport] = useState(getCropViewport);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const cropper = useImageCropper(cropSource?.image, viewport);

  // Giải phóng bộ nhớ ảnh tạm khi đổi ảnh khác / đóng
  useEffect(() => () => cropSource && URL.revokeObjectURL(cropSource.objectUrl), [cropSource]);

  const openEditor = () => {
    setCropSource(null);
    setError('');
    modal.open();
  };

  const pickFile = async (file) => {
    if (!file) return;
    if (file.size > COVER_INPUT_MAX_MB * BYTES_PER_MB) return setError(`Ảnh tối đa ${COVER_INPUT_MAX_MB}MB`);
    try {
      setViewport(getCropViewport());
      setCropSource(await loadImageFile(file));
      setError('');
    } catch (readError) {
      setError(readError.message);
    }
  };

  const persist = async (request, message) => {
    setIsSaving(true);
    try {
      const { profile: updated } = await request();
      updateUser(updated);
      showToast(message);
      setCropSource(null);
      modal.close();
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const save = () => {
    const dataUrl = cropImageToDataUrl(cropSource.image, cropper.getCropArea(), COVER_OUTPUT);
    return persist(() => uploadCoverApi(dataUrl), 'Đã cập nhật ảnh bìa');
  };

  return {
    modal, openEditor, error, isSaving, pickFile, save,
    remove: () => persist(deleteCoverApi, 'Đã xoá ảnh bìa'),
    coverUrl: profile?.cover_url ?? null,
    crop: cropSource && { src: cropSource.objectUrl, viewportSize: viewport, cropper, cancel: () => setCropSource(null) },
  };
};
