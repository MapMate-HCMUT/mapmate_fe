import { ChipGroup } from '../../../components/form/ChipGroup';
import { FormAlert } from '../../../components/form/FormAlert';
import { Modal } from '../../../components/Modal';
import { usePostComposer } from '../hooks/usePostComposer';
import { POST_CONTENT_MAX_LENGTH, POST_TYPE_OPTIONS, POST_TYPES, VISIBILITY_OPTIONS } from '../utils/socialConfig';
import { ComposerAttachment } from './ComposerAttachment';
import { ComposerMediaPicker } from './ComposerMediaPicker';
import { FriendPicker } from './FriendPicker';
import { StarRating } from './StarRating';
import { TagInput } from './TagInput';

const PLACEHOLDERS = {
  [POST_TYPES.PLACE]: 'Bạn thấy nơi này thế nào? Món gì ngon, nên đi lúc nào…',
  [POST_TYPES.ITINERARY]: 'Giới thiệu đôi chút về lộ trình này…',
  [POST_TYPES.TEXT]: 'Hỏi gợi ý, rủ bạn bè đi chơi…',
};
const Label = ({ children }) => <p className="text-sm font-semibold text-neutral-700 mb-1.5">{children}</p>;

// Khung đăng bài dùng chung cho cả trang Khám phá (mở qua socialStore.openComposer).
export const PostComposerModal = () => {
  const composer = usePostComposer();
  const { draft, sources } = composer;

  return (
    <Modal isOpen={composer.isOpen} title="Đăng bài" onClose={composer.close} size="lg">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          composer.submit();
        }}
      >
        <FormAlert message={composer.error} />
        {!composer.isTypeLocked && <ChipGroup size="sm" options={POST_TYPE_OPTIONS} value={draft.type} onChange={(type) => composer.update({ type })} ariaLabel="Loại bài viết" />}

        <ComposerAttachment draft={draft} sources={sources} onUpdate={composer.update} isLocked={composer.isTypeLocked} />

        {draft.type === POST_TYPES.PLACE && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2 text-sm text-neutral-700">Đánh giá của bạn: <StarRating value={draft.rating} onChange={(rating) => composer.update({ rating })} size="text-xl" /></span>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input type="checkbox" checked={draft.visited} onChange={(event) => composer.update({ visited: event.target.checked })} className="w-4 h-4 accent-primary-600" />
              Mình đã đến đây (tự ghim vào “Đã đi”)
            </label>
          </div>
        )}

        <div>
          <textarea
            value={draft.content}
            onChange={(event) => composer.update({ content: event.target.value })}
            maxLength={POST_CONTENT_MAX_LENGTH}
            rows={4}
            placeholder={PLACEHOLDERS[draft.type]}
            aria-label="Nội dung bài viết"
            className="w-full p-3 bg-surface border border-neutral-300 rounded-input text-sm resize-y focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="text-right text-[11px] text-neutral-400">{draft.content.length}/{POST_CONTENT_MAX_LENGTH}</p>
        </div>

        <ComposerMediaPicker media={composer.media} />

        <div>
          <Label>Hashtag</Label>
          <TagInput tags={draft.tags} inputValue={draft.tagInput} onInputChange={(tagInput) => composer.update({ tagInput })} onAdd={composer.addTag} onRemove={composer.removeTag} />
        </div>
        <div>
          <Label>Gắn thẻ bạn bè</Label>
          <FriendPicker friends={sources.friends} selectedIds={draft.taggedIds} onToggle={composer.toggleTagged} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <ChipGroup size="sm" options={VISIBILITY_OPTIONS} value={draft.visibility} onChange={(visibility) => composer.update({ visibility })} ariaLabel="Ai xem được" />
          <button type="submit" disabled={composer.isSubmitting || composer.media.isUploading} className="px-6 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
            {composer.isSubmitting ? 'Đang đăng…' : composer.media.isUploading ? 'Đang tải ảnh…' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
