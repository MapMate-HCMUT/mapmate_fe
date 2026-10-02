import { Modal } from '../../../components/Modal';
import { FriendPicker } from './FriendPicker';

const MESSAGE_MAX_LENGTH = 200;

export const ShareToFriendsModal = ({ share }) => (
  <Modal isOpen={share.modal.isOpen} title="Gửi cho bạn bè" onClose={share.modal.close} containerRef={share.modal.containerRef}>
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">Bạn bè được chọn sẽ nhận thông báo kèm đường dẫn tới bài viết này.</p>
      {share.friends.isLoading ? (
        <div className="h-10 rounded-input bg-neutral-100 animate-pulse" />
      ) : (
        <FriendPicker friends={share.friends.items} selectedIds={share.selectedIds} onToggle={share.toggleFriend} />
      )}
      <input
        type="text"
        value={share.message}
        onChange={(event) => share.setMessage(event.target.value)}
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder="Lời nhắn (không bắt buộc)"
        aria-label="Lời nhắn"
        className="w-full py-2.5 px-3 bg-surface border border-neutral-300 rounded-input text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
      <button
        type="button"
        onClick={share.send}
        disabled={share.isSending || share.selectedIds.length === 0}
        className="w-full py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-50"
      >
        {share.isSending ? 'Đang gửi…' : `Gửi cho ${share.selectedIds.length} người`}
      </button>
    </div>
  </Modal>
);
