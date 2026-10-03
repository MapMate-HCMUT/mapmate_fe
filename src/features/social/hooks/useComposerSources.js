import { useEffect, useState } from 'react';
import { getMyItinerariesApi } from '../../itinerary';
import { getFriendsApi, searchPlacesByNameApi } from '../api/socialApi';
import { POST_TYPES, SEARCH_DEBOUNCE_MS } from '../utils/socialConfig';

// Dữ liệu để chọn trong khung đăng bài: bạn bè (gắn thẻ), lộ trình của tôi, tìm địa điểm theo tên.
export const useComposerSources = ({ isOpen, type }) => {
  const [friends, setFriends] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResult, setPlaceResult] = useState({ forQuery: '', items: [] });
  const keyword = placeQuery.trim();

  useEffect(() => {
    if (!isOpen) return undefined;
    let isActive = true;
    getFriendsApi().then((data) => isActive && setFriends(data.items)).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || type !== POST_TYPES.ITINERARY) return undefined;
    let isActive = true;
    getMyItinerariesApi().then((data) => isActive && setItineraries(data.items)).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [isOpen, type]);

  useEffect(() => {
    if (!keyword) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      searchPlacesByNameApi(keyword).then((data) => isActive && setPlaceResult({ forQuery: keyword, items: data.items })).catch(() => {});
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [keyword]);

  return { friends, itineraries, placeQuery, setPlaceQuery, placeResults: placeResult.forQuery === keyword ? placeResult.items : [] };
};
