import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { deleteAiSessionApi, getAiSessionsApi } from '../api/aiApi';

// Danh sách cuộc trò chuyện đã lưu (chỉ khi đăng nhập). `version` tăng sau mỗi lượt chat để tải lại.
export const useAiSessions = (version) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);

  const reload = useCallback(() => getAiSessionsApi().then((data) => setItems(data.items)).catch(() => {}), []);

  useEffect(() => {
    if (isAuthenticated) reload();
  }, [isAuthenticated, version, reload]);

  const remove = async (sessionId) => {
    try {
      await deleteAiSessionApi(sessionId);
      setItems((prev) => prev.filter((item) => item.id !== sessionId));
      showToast('Đã xoá cuộc trò chuyện', 'info');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  return { items: isAuthenticated ? items : [], remove };
};
