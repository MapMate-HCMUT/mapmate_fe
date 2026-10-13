import { useEffect, useRef, useState } from 'react';
import { formatMegabytes, getUploadConfigApi, mediaKindOf, readVideoDuration, uploadToCloudinary } from '../../social';
import { getBusinessUploadSignatureApi } from '../api/businessApi';
import { formatBytes } from '../utils/businessConfig';

let nextId = 0;
const fromSaved = (item) => ({
  id: item.public_id,
  kind: item.type,
  status: 'saved',
  previewUrl: item.type === 'video' ? item.poster_url : item.thumb_url,
  public_id: item.public_id,
  bytes: 0, // đã tính trong dung lượng đang dùng
  progress: 100,
  error: null,
});

/**
 * Bộ sưu tập ảnh / video của 1 cửa hàng: file cũ + file mới chọn (tải thẳng lên Cloudinary ngay khi chọn).
 * Giới hạn theo gói: số file, số video mỗi cửa hàng, dung lượng còn trống. Bỏ file cũ => server xoá khi bấm Lưu.
 */
export const useGalleryEditor = ({ saved = [], tier, usage }) => {
  const [items, setItems] = useState(() => saved.map(fromSaved));
  const [limits, setLimits] = useState(null);
  const [notice, setNotice] = useState('');
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach((item) => item.status !== 'saved' && URL.revokeObjectURL(item.previewUrl)), []);

  useEffect(() => {
    let isActive = true;
    getUploadConfigApi()
      .then((config) => isActive && setLimits(config))
      .catch(() => isActive && setLimits({ enabled: false }));
    return () => {
      isActive = false;
    };
  }, []);

  const patch = (id, changes) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const upload = async (item, file) => {
    try {
      const signed = await getBusinessUploadSignatureApi(item.kind);
      const result = await uploadToCloudinary(file, signed, (progress) => patch(item.id, { progress }));
      patch(item.id, { status: 'done', progress: 100, public_id: result.public_id });
    } catch (error) {
      patch(item.id, { status: 'error', error: error.message });
      setNotice(error.message);
    }
  };

  const storageLeft = () => usage.storage_bytes - usage.storage_used_bytes - itemsRef.current.filter((item) => item.status !== 'saved').reduce((sum, item) => sum + item.bytes, 0);

  const addFiles = async (fileList) => {
    setNotice('');
    if (!limits?.enabled) {
      setNotice(limits?.paused_reason ?? 'Tính năng tải ảnh / video đang tạm tắt');
      return;
    }
    const accepted = [];
    for (const file of Array.from(fileList)) {
      const current = [...itemsRef.current, ...accepted];
      const kind = mediaKindOf(file);
      const maxBytes = kind === 'video' ? limits.video_max_bytes : limits.image_max_bytes;
      const problem = !kind
        ? `"${file.name}" không phải ảnh hoặc video`
        : current.length >= tier.gallery_items
          ? `Gói ${tier.label}: tối đa ${tier.gallery_items} ảnh / video mỗi cửa hàng`
          : kind === 'video' && !limits.video_enabled
            ? limits.paused_reason ?? 'Hiện chưa nhận video'
            : kind === 'video' && current.filter((item) => item.kind === 'video').length >= tier.gallery_videos
              ? `Gói ${tier.label}: tối đa ${tier.gallery_videos} video mỗi cửa hàng`
              : file.size > maxBytes
                ? `"${file.name}" quá lớn (tối đa ${formatMegabytes(maxBytes)})`
                : file.size > storageLeft() - accepted.reduce((sum, item) => sum + item.bytes, 0)
                  ? `Gói ${tier.label} chỉ còn trống ${formatBytes(Math.max(0, storageLeft()))} — nâng gói hoặc bỏ bớt file`
                  : null;
      if (problem) {
        setNotice(problem);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      if (kind === 'video') {
        const duration = await readVideoDuration(previewUrl);
        if (duration && duration > limits.video_max_seconds) {
          URL.revokeObjectURL(previewUrl);
          setNotice(`Video tối đa ${limits.video_max_seconds} giây — bạn cắt ngắn lại giúp mình nhé`);
          continue;
        }
      }
      nextId += 1;
      accepted.push({ id: `new${nextId}`, kind, status: 'uploading', previewUrl, public_id: null, bytes: file.size, progress: 0, error: null, file });
    }
    if (!accepted.length) return;
    setItems((prev) => [...prev, ...accepted]);
    accepted.forEach((item) => upload(item, item.file));
  };

  const remove = (id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target && target.status !== 'saved') URL.revokeObjectURL(target.previewUrl);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const retry = (id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (!target?.file) return;
    patch(id, { status: 'uploading', progress: 0, error: null });
    upload(target, target.file);
  };

  const savedIds = saved.map((item) => item.public_id).join(',');
  const currentIds = items.filter((item) => item.public_id).map((item) => item.public_id).join(',');

  return {
    items,
    notice,
    isEnabled: Boolean(limits?.enabled),
    addFiles,
    remove,
    retry,
    isUploading: items.some((item) => item.status === 'uploading'),
    hasFailed: items.some((item) => item.status === 'error'),
    isDirty: savedIds !== currentIds,
    // Danh sách gửi server khi lưu (đúng thứ tự đang hiển thị)
    toPayload: () => items.filter((item) => item.public_id && item.status !== 'error').map((item) => ({ public_id: item.public_id, resource_type: item.kind })),
  };
};
