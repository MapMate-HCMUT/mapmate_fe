import { useUserPins } from '../hooks/useSocialLists';
import { PinList } from './PinsPanel';

// Mục "Những nơi đã đi" trên hồ sơ công khai của 1 người.
export const UserPinsSection = ({ userId }) => {
  const { pins, isLoading } = useUserPins(userId);
  if (isLoading) return null;
  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <h2 className="text-base font-bold text-neutral-900 mb-3">📌 Những nơi đã đi <span className="text-sm font-semibold text-neutral-400">{pins.length}</span></h2>
      <PinList pins={pins} showPin={false} emptyText="Người này chưa ghim địa điểm nào." />
    </section>
  );
};
