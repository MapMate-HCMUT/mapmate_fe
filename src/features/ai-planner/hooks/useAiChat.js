import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { isPageLevelError } from '../../../utils/errorMessages';
import { useExploreOrigin } from '../../explore';
import { getAiSessionApi, sendAiMessageApi } from '../api/aiApi';

const TIER_KEY = 'mapmate.aiTier';
const PROMPT_HISTORY_KEY = 'mapmate.aiPromptHistory';
const PROMPT_HISTORY_MAX = 50;
const RECENT_PROMPTS_MAX = 6; // khớp AI_HISTORY_TURNS của server — để AI biết người dùng đang hỏi lại y hệt
// "quán cà phê nào gần tôi", "quanh đây có gì ăn" => cần vị trí thật, không phải trung tâm Quận 1
const NEAR_ME = /((gần|quanh|xung quanh)\s*(tôi|mình|em|tui|tớ|đây|nhà|chỗ (tôi|mình))|near me|nearby)/i;
let nextId = 0;
const newId = () => {
  nextId += 1;
  return `m${nextId}`;
};

// Câu đã gửi (mới nhất cuối) — ô nhập bấm ↑ / ↓ để gọi lại, sửa chút rồi gửi; giữ cả khi mở cuộc trò chuyện mới
const loadPromptHistory = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PROMPT_HISTORY_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((item) => typeof item === 'string').slice(-PROMPT_HISTORY_MAX) : [];
  } catch {
    return [];
  }
};
const savePromptHistory = (items) => {
  try {
    window.localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // trình duyệt chặn storage => chỉ nhớ trong lần mở trang này
  }
};

const loadTier = (fallback) => {
  try {
    return window.localStorage.getItem(TIER_KEY) ?? fallback;
  } catch {
    return fallback;
  }
};

// Ngữ cảnh gửi kèm cho khách chưa đăng nhập (người đã đăng nhập thì server tự nhớ theo session_id).
// pending = yêu cầu đang chờ (AI vừa hỏi lại / từ chối vì phi thực tế) => câu trả lời ngắn lượt sau được ghép vào.
// recent_place_ids = nơi vừa gợi ý ở các lượt gần nhất => lượt sau AI đổi gió, không lặp lại (khớp giới hạn của server)
const RECENT_PLACES_MAX = 60;
const toContext = (data, previous) => {
  const remembered = data.understood && !data.refusal
    ? { criteria: data.understood.criteria, must_visit_ids: data.understood.must_visit.map((place) => place.id) }
    : { criteria: previous?.criteria ?? null, must_visit_ids: previous?.must_visit_ids ?? [] };
  const suggested = (data.options ?? []).flatMap((option) => option.place_ids ?? []).map(String);
  const recent = [...new Set([...(previous?.recent_place_ids ?? []), ...suggested])].slice(-RECENT_PLACES_MAX);
  return { ...remembered, pending: data.pending ?? null, recent_place_ids: recent };
};

// Tin nhắn AI lưu trong phiên cũ => cùng dạng với câu trả lời mới để hiển thị lại (lộ trình không lưu kèm)
const toRestoredData = (message) => ({
  reply: message.reply,
  intent: message.intent,
  clarifying_questions: message.clarifying_questions ?? [],
  refusal: message.refusal ?? null,
  place_answer: message.place_answer ?? null,
  weather: message.weather ?? null,
  options: [],
  places: [],
  follow_up_suggestions: [],
  tips: [],
  warnings: [],
  trace: [],
});

/**
 * Hội thoại với AI Planner: gửi câu tự do, nhận câu trả lời + tiêu chí đã hiểu + lộ trình / địa điểm.
 * Nhớ ngữ cảnh nhiều lượt ("rẻ hơn chút", "thêm cà phê"), chọn chế độ Nhanh / Thông minh, dùng chung điểm xuất phát với Khám phá.
 */
export const useAiChat = ({ defaultTier = 'smart', onSent } = {}) => {
  const { isAuthenticated } = useAuth();
  const { origin, isLocating, locateMe } = useExploreOrigin();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [context, setContext] = useState(null);
  const [isSending, setIsSending] = useState(false);
  // Mất mạng / máy chủ không phản hồi => cả trang AI hiện màn hình lỗi (như khi mất Wi‑Fi), giữ nguyên cuộc trò chuyện
  const [pageError, setPageError] = useState(null); // { kind, retryText }
  const [tier, setTierState] = useState(() => loadTier(defaultTier));
  const [promptHistory, setPromptHistory] = useState(loadPromptHistory);

  const rememberPrompt = (text) =>
    setPromptHistory((prev) => {
      const next = [...prev.filter((item) => item !== text), text].slice(-PROMPT_HISTORY_MAX);
      savePromptHistory(next);
      return next;
    });

  const setTier = (value) => {
    setTierState(value);
    try {
      window.localStorage.setItem(TIER_KEY, value);
    } catch {
      // bỏ qua nếu trình duyệt chặn storage
    }
  };

  // fresh = mở cuộc trò chuyện mới với câu này (VD bấm "Lên lộ trình Halloween cùng AI" trên thanh điều hướng)
  const send = async (rawText, { fresh = false } = {}) => {
    const text = rawText.trim();
    if (!text || isSending) return false;
    if (fresh) {
      setPageError(null);
      setSessionId(null);
      setContext(null);
    }
    const recentPrompts = fresh ? [] : messages.filter((message) => message.role === 'user').map((message) => message.text).slice(-RECENT_PROMPTS_MAX);
    setMessages((prev) => [...(fresh ? [] : prev), { id: newId(), role: 'user', text }]);
    rememberPrompt(text);
    setIsSending(true);
    try {
      // Hỏi "gần tôi" mà chưa có vị trí => xin quyền định vị ngay (trình duyệt hỏi 1 lần), từ chối thì AI dùng trung tâm Quận 1 và nói rõ
      const from = origin.isDefault && NEAR_ME.test(text) ? await locateMe({ quiet: true }) : origin;
      const data = await sendAiMessageApi({
        message: text,
        session_id: isAuthenticated && !fresh ? sessionId : null,
        context: isAuthenticated || fresh ? null : { ...context, recent_prompts: recentPrompts },
        origin: !from || from.isDefault ? null : { lat: from.lat, lng: from.lng, label: from.label },
        model: tier,
      });
      // Hỏi "gần tôi" mà không lấy được vị trí (bị chặn quyền / hết giờ chờ) => nói rõ đang gợi ý quanh trung tâm Quận 1
      const locationFallback = NEAR_ME.test(text) && (!from || from.isDefault) ? { retryText: text } : null;
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', data, locationFallback }]);
      setSessionId(data.session_id ?? null);
      setContext((prev) => toContext(data, prev));
      onSent?.();
    } catch (error) {
      if (isPageLevelError(error)) {
        setMessages((prev) => prev.slice(0, -1)); // gửi lại sẽ thêm lại đúng câu này
        setPageError({ kind: error.kind, retryText: text });
      } else {
        setMessages((prev) => [...prev, { id: newId(), role: 'assistant', error: error.message, errorKind: error.kind, retryText: text }]);
      }
    } finally {
      setIsSending(false);
    }
    return true;
  };

  const retryAfterError = () => {
    const text = pageError?.retryText;
    setPageError(null);
    if (text) send(text);
  };
  const dismissPageError = () => setPageError(null);

  const newChat = () => {
    setPageError(null);
    setMessages([]);
    setSessionId(null);
    setContext(null);
  };

  // Mở lại cuộc trò chuyện cũ: hiện lại lời nhắn; lộ trình không lưu kèm => gửi tiếp để AI lên lại theo tiêu chí đã nhớ.
  const openSession = async (id) => {
    const session = await getAiSessionApi(id);
    setMessages(
      session.messages.map((message) =>
        message.role === 'user'
          ? { id: message.id, role: 'user', text: message.content }
          : { id: message.id, role: 'assistant', data: toRestoredData(message), restored: true },
      ),
    );
    setSessionId(session.id);
    setContext(null);
  };

  return { messages, isSending, send, newChat, openSession, sessionId, tier, setTier, origin, isLocating, locateMe, pageError, retryAfterError, dismissPageError, promptHistory };
};
