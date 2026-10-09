import { useEffect, useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { createPostApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';
import { isValidHashtag, normalizeHashtag, POST_MAX_TAGS, POST_TYPES } from '../utils/socialConfig';
import { useComposerSources } from './useComposerSources';
import { useMediaAttachments } from './useMediaAttachments';

const createDraft = (preset) => ({
  type: preset?.type ?? POST_TYPES.TEXT,
  place: preset?.place ?? null,
  itinerary: preset?.itinerary ?? null,
  content: '',
  rating: null,
  visited: preset?.visited ?? false, // mở từ nút "Viết đánh giá" => mặc định đã đến
  tags: preset?.itinerary?.tags ?? [],
  tagInput: '',
  taggedIds: [],
  visibility: 'public',
});

// Khung đăng bài: giới thiệu địa điểm / chia sẻ lộ trình / trạng thái — kèm hashtag, gắn thẻ bạn bè, quyền xem.
export const usePostComposer = () => {
  const composer = useSocialStore((state) => state.composer);
  const closeComposer = useSocialStore((state) => state.closeComposer);
  const bumpFeed = useSocialStore((state) => state.bumpFeed);
  const { showToast } = useToast();
  const [draft, setDraft] = useState(() => createDraft(null));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mỗi lần mở khung (composer là object mới) => bắt đầu bản nháp mới theo preset.
  const [trackedComposer, setTrackedComposer] = useState(composer);
  if (composer !== trackedComposer) {
    setTrackedComposer(composer);
    setDraft(createDraft(composer.preset));
    setError('');
  }

  const sources = useComposerSources({ isOpen: composer.isOpen, type: draft.type });
  const media = useMediaAttachments(composer.isOpen);
  const { reset: resetMedia } = media;
  useEffect(() => resetMedia(), [composer, resetMedia]); // mở khung mới => bỏ ảnh / video của lần trước
  const update = (changes) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    setError('');
  };

  const addTag = () => {
    const tag = normalizeHashtag(draft.tagInput);
    if (!tag) return;
    if (!isValidHashtag(tag)) return setError('Hashtag chỉ gồm chữ, số, "_" và tối đa 30 ký tự');
    if (draft.tags.length >= POST_MAX_TAGS) return setError(`Tối đa ${POST_MAX_TAGS} hashtag`);
    update({ tags: draft.tags.includes(tag) ? draft.tags : [...draft.tags, tag], tagInput: '' });
  };

  const validate = () => {
    if (draft.type === POST_TYPES.PLACE && !draft.place) return 'Hãy chọn địa điểm muốn giới thiệu';
    if (draft.type === POST_TYPES.ITINERARY && !draft.itinerary) return 'Hãy chọn lộ trình muốn chia sẻ';
    if (draft.type === POST_TYPES.TEXT && !draft.content.trim() && !media.uploaded.length) return 'Hãy viết gì đó hoặc thêm ảnh trước khi đăng';
    if (media.isUploading) return 'Đợi ảnh / video tải lên xong rồi đăng nhé';
    if (media.hasFailed) return 'Có ảnh / video tải lên bị lỗi — bấm "Thử lại" hoặc xoá file đó';
    return '';
  };

  const submit = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    const pendingTag = normalizeHashtag(draft.tagInput);
    const tags = pendingTag && isValidHashtag(pendingTag) && !draft.tags.includes(pendingTag) ? [...draft.tags, pendingTag] : draft.tags;

    setIsSubmitting(true);
    try {
      await createPostApi({
        type: draft.type,
        content: draft.content.trim(),
        place_id: draft.place?.id,
        itinerary_id: draft.itinerary?.id,
        rating: draft.type === POST_TYPES.PLACE ? draft.rating : undefined,
        visited: draft.type === POST_TYPES.PLACE && draft.visited,
        tags: tags.slice(0, POST_MAX_TAGS),
        tagged_user_ids: draft.taggedIds,
        visibility: draft.visibility,
        media: media.uploaded,
      });
      showToast('Đã đăng bài lên bảng tin');
      bumpFeed();
      closeComposer();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
    return undefined;
  };

  return {
    isOpen: composer.isOpen,
    isTypeLocked: Boolean(composer.preset?.type),
    close: closeComposer,
    draft,
    update,
    addTag,
    removeTag: (tag) => update({ tags: draft.tags.filter((item) => item !== tag) }),
    toggleTagged: (userId) => update({ taggedIds: draft.taggedIds.includes(userId) ? draft.taggedIds.filter((id) => id !== userId) : [...draft.taggedIds, userId] }),
    error,
    isSubmitting,
    submit,
    sources,
    media,
  };
};
