import { useFriendAction } from '../hooks/useFriendAction';

const base = 'px-3 py-1.5 rounded-button text-xs font-semibold transition disabled:opacity-60';
const primary = `${base} bg-primary-600 text-white hover:bg-primary-700`;
const soft = `${base} bg-neutral-100 text-neutral-700 hover:bg-neutral-200`;
const danger = `${base} text-danger-600 hover:bg-danger-50`;

// Nút kết bạn đổi theo quan hệ: Kết bạn · Huỷ lời mời · Đồng ý/Từ chối · Bạn bè (huỷ kết bạn).
export const FriendActionButton = ({ userId, relationship: initialRelationship }) => {
  const { relationship, isBusy, sendRequest, accept, cancelOrDecline, unfriend } = useFriendAction(userId, initialRelationship);

  switch (relationship.status) {
    case 'self':
      return null;
    case 'friends':
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-xs font-semibold text-success-700">✓ Bạn bè</span>
          <button type="button" disabled={isBusy} onClick={unfriend} className={danger}>Huỷ kết bạn</button>
        </span>
      );
    case 'pending_sent':
      return <button type="button" disabled={isBusy} onClick={cancelOrDecline} className={soft}>Huỷ lời mời</button>;
    case 'pending_received':
      return (
        <span className="inline-flex items-center gap-1.5">
          <button type="button" disabled={isBusy} onClick={accept} className={primary}>Đồng ý</button>
          <button type="button" disabled={isBusy} onClick={cancelOrDecline} className={soft}>Từ chối</button>
        </span>
      );
    default:
      return <button type="button" disabled={isBusy} onClick={sendRequest} className={primary}>＋ Kết bạn</button>;
  }
};
