import { useState } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useToast } from '../../../hooks/useToast';
import { deleteTrashItemApi, emptyTrashApi, getTrashApi, restoreTrashItemApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';

/** Thùng rác: danh sách + khôi phục / xoá vĩnh viễn từng mục / dọn sạch. Khôi phục xong => bảng tin tải lại. */
export const useTrash = () => {
  const trash = useAsyncData(getTrashApi, 'trash', { pageLevel: true });
  const bumpFeed = useSocialStore((state) => state.bumpFeed);
  const { showToast } = useToast();
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const [busyId, setBusyId] = useState(null);

  const items = (trash.data?.items ?? []).filter((item) => !removedIds.has(item.id));
  const drop = (id) => setRemovedIds((prev) => new Set(prev).add(id));

  const run = async (id, task) => {
    setBusyId(id);
    try {
      await task();
      drop(id);
      return true;
    } catch (error) {
      showToast(error.message, 'danger'); // VD bài chứa ảnh này đang ở thùng rác / bài đã đủ 6 ảnh
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const restore = async (item) => {
    if (await run(item.id, () => restoreTrashItemApi(item.id))) bumpFeed();
  };
  const remove = (item) => {
    if (!window.confirm('Xoá vĩnh viễn mục này? Không thể khôi phục lại.')) return;
    run(item.id, () => deleteTrashItemApi(item.id));
  };
  const empty = async () => {
    if (!window.confirm(`Xoá vĩnh viễn cả ${items.length} mục trong thùng rác? Không thể khôi phục lại.`)) return;
    setBusyId('all');
    try {
      await emptyTrashApi();
      setRemovedIds(new Set(items.map((item) => item.id)));
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setBusyId(null);
    }
  };

  return { items, isLoading: trash.isLoading, error: trash.error, reload: trash.reload, retentionDays: trash.data?.retention_days ?? 30, busyId, restore, remove, empty };
};
