import { apiClient } from '../../../lib/apiClient';

// 1 lượt AI gồm 2 lần gọi Groq + lên lộ trình => cho phép chờ lâu hơn request thường.
const AI_TIMEOUT_MS = 90000;

// GET /api/ai/options -> { llm_enabled, default_model, models[], examples[], prompt_max_length }
export const getAiOptionsApi = () => apiClient.get('/ai/options');

// POST /api/ai/chat { message, session_id?, context?, origin?, model } -> câu trả lời + tiêu chí đã hiểu + lộ trình / địa điểm
export const sendAiMessageApi = (payload) => apiClient.post('/ai/chat', payload, { timeout: AI_TIMEOUT_MS });

export const getAiSessionsApi = () => apiClient.get('/ai/sessions');
export const getAiSessionApi = (sessionId) => apiClient.get(`/ai/sessions/${sessionId}`);
export const deleteAiSessionApi = (sessionId) => apiClient.delete(`/ai/sessions/${sessionId}`);
