import { useAuth } from '../../../hooks/useAuth';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useCloneItinerary } from '../../itinerary';
import { useSocialStore } from '../stores/socialStore';
import { useFeed } from './useFeed';
import { usePostActions } from './usePostActions';
import { useShareToFriends } from './useShareToFriends';

// Gom logic của tab Bảng tin.
export const useFeedTab = () => {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const openComposerInStore = useSocialStore((state) => state.openComposer);
  const feed = useFeed();

  return {
    feed,
    user,
    actions: usePostActions(feed),
    share: useShareToFriends(),
    clone: useCloneItinerary(),
    openComposer: requireAuth(() => openComposerInStore(null)),
  };
};
