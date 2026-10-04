import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useToast } from './useToast';

const MAX_RECORD_MS = 20000; // tự dừng sau 20 giây
const LEVEL_SAMPLE_MS = 100;
const VOICE_LEVEL = 0.035; // âm lượng (RMS) coi là có tiếng nói
const MIN_VOICED_MS = 400; // phải nghe thấy tiếng nói ≥ 0,4 giây mới gửi đi nhận dạng
const TRANSCRIBE_TIMEOUT_MS = 30000;
// Thứ tự ưu tiên định dạng ghi âm (Chrome/Firefox: webm, Safari: mp4)
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const pickMimeType = () => MIME_CANDIDATES.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) ?? '';
export const isVoiceSupported = () => typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

/**
 * Nói thay vì gõ: ghi âm bằng micro trình duyệt => POST /api/ai/transcribe (Groq Whisper, tự nhận tiếng Việt / tiếng Anh).
 * Đo âm lượng trong lúc ghi: không nghe thấy tiếng nói thì không gửi (Whisper hay "bịa" chữ khi im lặng).
 * status: idle | recording | transcribing
 */
export const useVoiceInput = ({ onText }) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState('idle');
  const session = useRef(null); // { recorder, stream, audioContext, timers, voicedMs, chunks }

  const cleanup = useCallback(() => {
    const current = session.current;
    if (!current) return;
    current.timers.forEach(clearInterval);
    current.stream.getTracks().forEach((track) => track.stop());
    current.audioContext?.close().catch(() => {});
    session.current = null;
  }, []);

  useEffect(() => () => {
    if (session.current?.recorder.state === 'recording') session.current.recorder.stop();
    cleanup();
  }, [cleanup]);

  const transcribe = async (blob) => {
    setStatus('transcribing');
    try {
      const { text } = await apiClient.post('/ai/transcribe', blob, { headers: { 'Content-Type': blob.type.split(';')[0] }, timeout: TRANSCRIBE_TIMEOUT_MS });
      onText(text);
    } catch (error) {
      showToast(error.message, 'warning');
    } finally {
      setStatus('idle');
    }
  };

  const start = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (error) {
      showToast(error.name === 'NotAllowedError' ? 'Bạn chưa cho phép MapMate dùng micro' : 'Không mở được micro trên thiết bị này', 'warning');
      return;
    }
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const current = { recorder, stream, audioContext: null, timers: [], voicedMs: 0, chunks: [] };
    session.current = current;

    // Đo âm lượng để biết có tiếng nói thật hay không
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      current.audioContext = audioContext;
      current.timers.push(setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
        if (rms > VOICE_LEVEL) current.voicedMs += LEVEL_SAMPLE_MS;
      }, LEVEL_SAMPLE_MS));
    } catch {
      current.voicedMs = MIN_VOICED_MS; // trình duyệt không đo được => vẫn gửi
    }

    recorder.ondataavailable = (event) => event.data.size && current.chunks.push(event.data);
    recorder.onstop = () => {
      const { chunks, voicedMs } = current;
      cleanup();
      if (voicedMs < MIN_VOICED_MS) {
        setStatus('idle');
        showToast('Mình chưa nghe thấy gì, bạn bấm micro và nói lại nhé', 'warning');
        return;
      }
      transcribe(new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }));
    };
    current.timers.push(setInterval(() => recorder.state === 'recording' && recorder.stop(), MAX_RECORD_MS));
    recorder.start();
    setStatus('recording');
  };

  const toggle = () => {
    if (status === 'transcribing') return;
    if (status === 'recording') session.current?.recorder.stop();
    else start();
  };

  return { status, toggle, isSupported: isVoiceSupported() };
};
