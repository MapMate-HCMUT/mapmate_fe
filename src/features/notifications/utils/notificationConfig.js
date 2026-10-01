export const UNREAD_POLL_INTERVAL_MS = 60 * 1000; // hỏi số chưa đọc mỗi phút
export const BELL_PREVIEW_LIMIT = 5;
export const PANEL_PAGE_SIZE = 10;
export const MAX_BADGE_COUNT = 99;

export const formatBadgeCount = (count) => (count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count));
