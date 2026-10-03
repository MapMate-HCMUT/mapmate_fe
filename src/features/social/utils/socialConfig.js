import { Globe, Users, User, MapPin, Compass, MessageSquare, CheckCircle2, Bookmark } from 'lucide-react';

export const POST_TYPES = { PLACE: 'place', ITINERARY: 'itinerary', TEXT: 'text' };
export const FEED_PAGE_SIZE = 10;
export const POST_CONTENT_MAX_LENGTH = 1000;
export const POST_MAX_TAGS = 8;
export const SEARCH_DEBOUNCE_MS = 350;

export const FEED_SCOPES = [
  { value: 'public', label: 'Cộng đồng', icon: Globe, emoji: '🌐', requiresLogin: false },
  { value: 'friends', label: 'Bạn bè', icon: Users, emoji: '👥', requiresLogin: true },
  { value: 'mine', label: 'Của tôi', icon: User, emoji: '🙋', requiresLogin: true },
];

export const POST_TYPE_OPTIONS = [
  { value: POST_TYPES.PLACE, label: 'Giới thiệu địa điểm', icon: MapPin, emoji: '📍' },
  { value: POST_TYPES.ITINERARY, label: 'Chia sẻ lộ trình', icon: Compass, emoji: '🧭' },
  { value: POST_TYPES.TEXT, label: 'Trạng thái', icon: MessageSquare, emoji: '💬' },
];

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai', icon: Globe, emoji: '🌐' },
  { value: 'friends', label: 'Bạn bè', icon: Users, emoji: '👥' },
];

export const PIN_OPTIONS = [
  { value: 'visited', label: 'Đã đi', icon: CheckCircle2, emoji: '✅' },
  { value: 'wishlist', label: 'Muốn đi', icon: Bookmark, emoji: '💭' },
];
export const getPinOption = (status) => PIN_OPTIONS.find((option) => option.value === status) ?? null;

// "#Hẹn Hò " -> "hẹnhò" (giống cách backend chuẩn hoá)
export const normalizeHashtag = (text) => text.trim().replace(/^#+/, '').replace(/\s+/g, '').toLowerCase();
export const isValidHashtag = (tag) => /^[\p{L}\p{N}_]{1,30}$/u.test(tag);
