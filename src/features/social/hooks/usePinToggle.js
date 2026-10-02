import { useDisclosure } from '../../../hooks/useDisclosure';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { removePinApi, setPinApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';

// Ghim / đổi trạng thái / bỏ ghim 1 địa điểm. Cập nhật giao diện ngay, lỗi thì trả về trạng thái cũ.
export const usePinToggle = (placeId, initialStatus = null) => {
  const { containerRef, ...menu } = useDisclosure();
  const override = useSocialStore((state) => state.pinStatus[placeId]);
  const setPinStatus = useSocialStore((state) => state.setPinStatus);
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();
  const status = override !== undefined ? override : initialStatus;

  const choose = requireAuth(async (nextStatus) => {
    menu.close();
    if (nextStatus === status) return;
    setPinStatus(placeId, nextStatus);
    try {
      if (nextStatus) {
        const pin = await setPinApi(placeId, { status: nextStatus });
        showToast(pin.status === 'visited' ? 'Đã ghim vào "Đã đi"' : 'Đã ghim vào "Muốn đi"');
      } else {
        await removePinApi(placeId);
        showToast('Đã bỏ ghim', 'info');
      }
    } catch (error) {
      setPinStatus(placeId, status);
      showToast(error.message, 'danger');
    }
  });

  return { status, menu, menuRef: containerRef, choose };
};
