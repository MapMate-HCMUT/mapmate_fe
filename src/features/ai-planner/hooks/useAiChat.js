import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useExploreOrigin } from '../../explore';
import { getAiSessionApi, sendAiMessageApi } from '../api/aiApi';

const TIER_KEY = 'mapmate.aiTier';
let nextId = 0;
const newId = () => {
  nextId += 1;
  return `m${nextId}`;
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
const toContext = (data, previous) => {
  const remembered = data.understood && !data.refusal
    ? { criteria: data.understood.criteria, must_visit_ids: data.understood.must_visit.map((place) => place.id) }
    : { criteria: previous?.criteria ?? null, must_visit_ids: previous?.must_visit_ids ?? [] };
  return { ...remembered, pending: data.pending ?? null };
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
  const [tier, setTierState] = useState(() => loadTier(defaultTier));

  const setTier = (value) => {
    setTierState(value);
    try {
      window.localStorage.setItem(TIER_KEY, value);
    } catch {
      // bỏ qua nếu trình duyệt chặn storage
    }
  };

  const send = async (rawText) => {
    const text = rawText.trim();
    if (!text || isSending) return false;
    setMessages((prev) => [...prev, { id: newId(), role: 'user', text }]);
    setIsSending(true);
    try {
      const data = await sendAiMessageApi({
        message: text,
        session_id: isAuthenticated ? sessionId : null,
        context: isAuthenticated ? null : context,
        origin: origin.isDefault ? null : { lat: origin.lat, lng: origin.lng, label: origin.label },
        model: tier,
      });
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', data }]);
      setSessionId(data.session_id ?? null);
      setContext((prev) => toContext(data, prev));
      onSent?.();
    } catch (error) {
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', error: error.message, retryText: text }]);
    } finally {
      setIsSending(false);
    }
    return true;
  };

  const newChat = () => {
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

  return { messages, isSending, send, newChat, openSession, sessionId, tier, setTier, origin, isLocating, locateMe };
};
