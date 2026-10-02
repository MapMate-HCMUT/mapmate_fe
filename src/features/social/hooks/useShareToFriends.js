import { useEffect, useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { getFriendsApi, sharePostApi } from '../api/socialApi';

// "Gửi cho bạn bè": chọn bạn + lời nhắn => bạn nhận được thông báo dẫn tới bài viết.
export const useShareToFriends = () => {
  const modal = useDisclosure();
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();
  const [post, setPost] = useState(null);
  const [friends, setFriends] = useState({ items: [], isLoading: true });
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!modal.isOpen) return undefined;
    let isActive = true;
    getFriendsApi()
      .then((data) => isActive && setFriends({ items: data.items, isLoading: false }))
      .catch(() => isActive && setFriends({ items: [], isLoading: false }));
    return () => {
      isActive = false;
    };
  }, [modal.isOpen]);

  const openFor = requireAuth((targetPost) => {
    setPost(targetPost);
    setSelectedIds([]);
    setMessage('');
    modal.open();
  });

  const copyLink = async (targetPost) => {
    const url = `${window.location.origin}/explore?tab=feed&post=${targetPost.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Đã copy link bài viết');
    } catch {
      showToast(`Link bài viết: ${url}`, 'info');
    }
  };

  const send = async () => {
    setIsSending(true);
    try {
      const { sent } = await sharePostApi(post.id, selectedIds, message.trim());
      showToast(`Đã gửi cho ${sent} người bạn`);
      modal.close();
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setIsSending(false);
    }
  };

  return {
    modal, openFor, copyLink, post, friends, selectedIds, message, setMessage, isSending, send,
    toggleFriend: (userId) => setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])),
  };
};
