import { useToast } from '../../../hooks/useToast';

// Chia sẻ link hồ sơ công khai: dùng bảng chia sẻ của điện thoại nếu có, không thì copy link.
export const useShareProfile = (profile) => {
  const { showToast } = useToast();

  return async () => {
    const url = `${window.location.origin}/users/${profile.id}`;
    const shareData = { title: `${profile.username} trên MapMate`, text: `Xem thành tích của ${profile.username} trên MapMate 🗺️`, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('Đã copy link hồ sơ');
    } catch (error) {
      if (error.name !== 'AbortError') showToast(`Không copy được, link của bạn: ${url}`, 'info');
    }
  };
};
