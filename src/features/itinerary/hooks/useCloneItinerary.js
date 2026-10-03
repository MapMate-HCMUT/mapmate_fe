import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { cloneItineraryApi } from '../api/itineraryApi';
import { useItineraryStore } from '../stores/itineraryStore';

// "Dùng lộ trình này": sao chép lộ trình người khác chia sẻ về tài khoản mình.
export const useCloneItinerary = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const bumpVersion = useItineraryStore((state) => state.bumpVersion);
  const [cloningId, setCloningId] = useState(null);

  const clone = async (itineraryId) => {
    if (!isAuthenticated) return navigate(`/login?redirect=${encodeURIComponent('/explore?tab=feed')}`);
    setCloningId(itineraryId);
    try {
      await cloneItineraryApi(itineraryId);
      bumpVersion();
      showToast('Đã lưu lộ trình về tab "Của tôi"');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setCloningId(null);
    }
    return undefined;
  };

  return { clone, cloningId };
};
