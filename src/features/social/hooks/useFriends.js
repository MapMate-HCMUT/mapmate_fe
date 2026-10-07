import { useAsyncData } from '../../../hooks/useAsyncData';
import { getFriendRequestsApi, getFriendsApi, getFriendSuggestionsApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';

const loadAll = async () => {
  const [friends, requests, suggestions] = await Promise.all([getFriendsApi(), getFriendRequestsApi(), getFriendSuggestionsApi()]);
  return { friends: friends.items, incoming: requests.incoming, outgoing: requests.outgoing, suggestions: suggestions.items };
};
const EMPTY = { friends: [], incoming: [], outgoing: [], suggestions: [] };

// Bạn bè + lời mời + gợi ý, tự tải lại sau mỗi thao tác kết bạn (friendsVersion).
export const useFriends = () => {
  const version = useSocialStore((state) => state.friendsVersion);
  const { data, error, isLoading, reload } = useAsyncData(loadAll, version, { pageLevel: true });
  return { ...(data ?? EMPTY), error, isLoading: isLoading && !data, reload };
};
