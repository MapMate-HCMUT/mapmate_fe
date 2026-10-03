import { useEffect, useState } from 'react';
import { searchUsersApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';
import { SEARCH_DEBOUNCE_MS } from '../utils/socialConfig';

// Tìm người theo username (chờ 350ms sau khi ngừng gõ).
export const usePeopleSearch = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ forQuery: '', items: [], error: null });
  const version = useSocialStore((state) => state.friendsVersion);
  const keyword = query.trim();

  useEffect(() => {
    if (!keyword) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      searchUsersApi(keyword)
        .then((data) => isActive && setResult({ forQuery: keyword, items: data.items, error: null }))
        .catch((error) => isActive && setResult({ forQuery: keyword, items: [], error }));
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [keyword, version]);

  const isCurrent = result.forQuery === keyword;
  return { query, setQuery, hasKeyword: Boolean(keyword), isSearching: Boolean(keyword) && !isCurrent, items: isCurrent ? result.items : [], error: isCurrent ? result.error : null };
};
