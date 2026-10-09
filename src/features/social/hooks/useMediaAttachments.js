import { useCallback, useEffect, useRef, useState } from 'react';
import { getUploadConfigApi, getUploadSignatureApi } from '../api/socialApi';
import { formatMegabytes, mediaKindOf, readVideoDuration, uploadToCloudinary } from '../utils/mediaUpload';

let nextId = 0;
const DISABLED = { enabled: false };

/**
 * Ảnh / video đính kèm trong khung đăng bài: chọn file => kiểm tra ngay (số lượng, dung lượng, thời lượng)
 * => tải luôn lên Cloudinary (có % tiến độ) => khi đăng bài chỉ gửi mã file đã tải xong.
 */
export const useMediaAttachments = (isOpen) => {
  const [config, setConfig] = useState(DISABLED);
  const [items, setItems] = useState([]);
  const [notice, setNotice] = useState('');
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let isActive = true;
    getUploadConfigApi()
      .then((data) => isActive && setConfig(data))
      .catch(() => isActive && setConfig(DISABLED));
    return () => {
      isActive = false;
    };
  }, [isOpen]);

  const patch = (id, changes) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const upload = async (item) => {
    try {
      const signed = await getUploadSignatureApi(item.kind);
      const result = await uploadToCloudinary(item.file, signed, (progress) => patch(item.id, { progress }));
      patch(item.id, { status: 'done', progress: 100, result });
    } catch (error) {
      patch(item.id, { status: 'error', error: error.message });
      setNotice(error.message); // VD hết lượt hôm nay / MapMate tạm ngưng nhận video — báo rõ, không chỉ hiện "Thử lại"
    }
  };

  const addFiles = async (fileList) => {
    setNotice('');
    const current = itemsRef.current;
    const currentVideos = current.filter((item) => item.kind === 'video').length;
    let videos = currentVideos;
    // Lượt còn lại hôm nay (server tính) trừ đi file đã chọn trong khung này
    const filesLeft = (config.quota?.files_left ?? Infinity) - current.length;
    const videosLeft = (config.quota?.videos_left ?? Infinity) - currentVideos;
    const accepted = [];
    for (const file of Array.from(fileList)) {
      const kind = mediaKindOf(file);
      const problem = !kind
        ? `"${file.name}" không phải ảnh hoặc video`
        : current.length + accepted.length >= config.max_items
          ? `Mỗi bài tối đa ${config.max_items} ảnh / video`
          : accepted.length >= filesLeft
            ? `Hôm nay bạn đã hết lượt tải (${config.daily_files} file / ngày) — mai bạn tải tiếp nhé`
            : kind === 'video' && !config.video_enabled
              ? config.paused_reason ?? 'Hiện chưa nhận video'
              : kind === 'video' && videos - currentVideos >= videosLeft
                ? `Hôm nay bạn đã hết lượt tải video (${config.daily_videos} video / ngày) — vẫn đăng ảnh được`
                : kind === 'video' && videos >= config.max_videos
                  ? `Mỗi bài tối đa ${config.max_videos} video`
            : file.size > (kind === 'video' ? config.video_max_bytes : config.image_max_bytes)
              ? `"${file.name}" quá lớn (tối đa ${formatMegabytes(kind === 'video' ? config.video_max_bytes : config.image_max_bytes)})`
              : null;
      if (problem) {
        setNotice(problem);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      if (kind === 'video') {
        const duration = await readVideoDuration(previewUrl);
        if (duration && duration > config.video_max_seconds) {
          URL.revokeObjectURL(previewUrl);
          setNotice(`Video tối đa ${config.video_max_seconds} giây — bạn cắt ngắn lại giúp mình nhé`);
          continue;
        }
        videos += 1;
      }
      nextId += 1;
      accepted.push({ id: `m${nextId}`, file, kind, previewUrl, progress: 0, status: 'uploading', error: null, result: null });
    }
    if (!accepted.length) return;
    setItems((prev) => [...prev, ...accepted]);
    accepted.forEach(upload);
  };

  const remove = (id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const retry = (id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (!target) return;
    patch(id, { status: 'uploading', progress: 0, error: null });
    upload(target);
  };

  const reset = useCallback(() => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setNotice('');
  }, []);

  return {
    isEnabled: Boolean(config.enabled),
    config,
    items,
    notice,
    addFiles,
    remove,
    retry,
    reset,
    isUploading: items.some((item) => item.status === 'uploading'),
    hasFailed: items.some((item) => item.status === 'error'),
    uploaded: items.filter((item) => item.status === 'done').map((item) => item.result),
  };
};
