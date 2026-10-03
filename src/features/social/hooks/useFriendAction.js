import { useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { acceptFriendRequestApi, removeFriendRequestApi, sendFriendRequestApi, unfriendApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';

// Các thao tác kết bạn với 1 người; `relationship` = { status, request_id } do server trả về.
export const useFriendAction = (userId, initialRelationship) => {
  const [relationship, setRelationship] = useState(initialRelationship ?? { status: 'none', request_id: null });
  const [isBusy, setIsBusy] = useState(false);
  const bumpFriends = useSocialStore((state) => state.bumpFriends);
  const bumpFeed = useSocialStore((state) => state.bumpFeed);
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();

  const run = (request, successMessage) =>
    requireAuth(async () => {
      setIsBusy(true);
      try {
        const data = await request();
        setRelationship(data.relationship);
        showToast(data.relationship.status === 'friends' ? 'Hai bạn đã trở thành bạn bè 🎉' : successMessage, data.relationship.status === 'none' ? 'info' : 'success');
        bumpFriends();
        bumpFeed(); // bảng tin bạn bè đổi theo danh sách bạn
      } catch (error) {
        showToast(error.message, 'danger');
      } finally {
        setIsBusy(false);
      }
    });

  return {
    relationship,
    isBusy,
    sendRequest: run(() => sendFriendRequestApi(userId), 'Đã gửi lời mời kết bạn'),
    accept: run(() => acceptFriendRequestApi(relationship.request_id), 'Hai bạn đã trở thành bạn bè'),
    cancelOrDecline: run(() => removeFriendRequestApi(relationship.request_id), 'Đã xoá lời mời kết bạn'),
    unfriend: run(() => unfriendApi(userId), 'Đã huỷ kết bạn'),
  };
};
