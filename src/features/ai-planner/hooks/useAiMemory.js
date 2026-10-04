import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { clearAiMemoryApi, forgetAiFactApi, forgetAiNoteApi, getAiMemoryApi, setAiMemoryEnabledApi } from '../api/aiApi';

// Ghi nhớ của AI (sở thích tự học + ghi chú "nhớ giúp..."). `version` tăng sau mỗi lượt chat => tải lại (AI có thể vừa học thêm).
export const useAiMemory = (version) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [memory, setMemory] = useState(null);

  const reload = useCallback(() => getAiMemoryApi().then(setMemory).catch(() => {}), []);
  useEffect(() => {
    if (isAuthenticated) reload();
  }, [isAuthenticated, version, reload]);

  const run = (request, message) => async (...args) => {
    try {
      setMemory(await request(...args));
      if (message) showToast(message, 'info');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  return {
    memory: isAuthenticated ? memory : null,
    setEnabled: run(setAiMemoryEnabledApi),
    clearAll: run(clearAiMemoryApi, 'Đã xoá toàn bộ ghi nhớ'),
    forgetFact: run(forgetAiFactApi),
    forgetNote: run(forgetAiNoteApi),
  };
};
