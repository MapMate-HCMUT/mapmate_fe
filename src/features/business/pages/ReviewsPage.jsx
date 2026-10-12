import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Avatar } from '../../../components/Avatar';
import { ErrorState } from '../../../components/ErrorState';
import { useToast } from '../../../hooks/useToast';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { getBusinessReviewsApi, replyReviewApi } from '../api/businessApi';
import { StarRow } from '../components/StarRow';
import { useConsole } from '../hooks/useConsole';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unreplied', label: 'Chưa trả lời' },
];
const REPLY_TEMPLATES = ['Cảm ơn bạn đã ghé quán! Hẹn gặp lại bạn nhé 💚', 'Xin lỗi vì trải nghiệm chưa tốt, quán sẽ cải thiện ngay. Mong bạn cho quán cơ hội phục vụ lại!'];

// Điểm trung bình + phân bố số sao (thanh ngang 1 màu, có số bên cạnh)
const Summary = ({ summary }) => {
  const max = Math.max(1, ...Object.values(summary.distribution));
  return (
    <section className="bg-surface rounded-card shadow-card p-4 sm:p-5 grid sm:grid-cols-[160px_1fr] gap-4 items-center">
      <div className="text-center">
        <p className="text-5xl font-semibold text-neutral-900 tabular-nums">{summary.average ?? '—'}</p>
        {summary.average && <StarRow value={Math.round(summary.average)} size="w-4 h-4" />}
        <p className="mt-1 text-xs text-neutral-500">{summary.count} đánh giá công khai</p>
        {summary.unreplied > 0 && <p className="mt-1 text-xs font-semibold text-warning-700">{summary.unreplied} chưa trả lời</p>}
      </div>
      <ul className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => (
          <li key={star} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-neutral-500 tabular-nums">{star}★</span>
            <span className="flex-1 h-2 rounded-pill bg-amber-100 overflow-hidden">
              <span className="block h-full rounded-pill bg-amber-400" style={{ width: `${(summary.distribution[star] / max) * 100}%` }} />
            </span>
            <span className="w-6 text-right text-neutral-600 tabular-nums">{summary.distribution[star]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

const ReviewItem = ({ review, onReplied }) => {
  const [isEditing, setIsEditing] = useState(!review.owner_reply);
  const [text, setText] = useState(review.owner_reply?.text ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const save = async (value) => {
    setIsSaving(true);
    try {
      const { owner_reply: reply } = await replyReviewApi(review.id, value);
      showToast(reply ? 'Đã gửi phản hồi — khách sẽ nhận được thông báo' : 'Đã xoá phản hồi');
      onReplied(review.id, reply);
      setIsEditing(!reply);
      if (!reply) setText('');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="bg-surface rounded-card shadow-card p-4">
      <div className="flex items-start gap-3">
        <Avatar name={review.author.username} src={review.author.avatar_url} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="font-semibold text-sm text-neutral-900">{review.author.username}</p>
            {review.rating && <StarRow value={review.rating} />}
            <span className="text-xs text-neutral-400">· {formatRelativeTime(review.created_at)} · {review.place.name}</span>
          </div>
          {review.content && <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">{review.content}</p>}
          {review.media.length > 0 && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none">
              {review.media.map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-16 h-16 rounded-input overflow-hidden bg-neutral-100">
                  <img src={item.type === 'video' ? item.poster_url : item.thumb_url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}

          {review.owner_reply && !isEditing ? (
            <div className="mt-3 rounded-input bg-secondary-50 border-l-4 border-secondary-500 p-3">
              <p className="text-xs font-bold text-secondary-800">Phản hồi của bạn</p>
              <p className="mt-0.5 text-sm text-neutral-700 whitespace-pre-line">{review.owner_reply.text}</p>
              <div className="mt-2 flex gap-3 text-xs font-semibold">
                <button type="button" onClick={() => setIsEditing(true)} className="text-primary-700 hover:underline">Sửa</button>
                <button type="button" disabled={isSaving} onClick={() => save('')} className="text-danger-600 hover:underline">Xoá</button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea rows={2} maxLength={500} value={text} onChange={(event) => setText(event.target.value)} placeholder="Viết phản hồi công khai cho khách…" className="w-full py-2 px-3 border border-neutral-300 rounded-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              <div className="flex flex-wrap items-center gap-1.5">
                {REPLY_TEMPLATES.map((template) => (
                  <button key={template} type="button" onClick={() => setText(template)} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-[11px] text-neutral-600 max-w-full truncate">{template}</button>
                ))}
                <span className="flex-1" />
                {review.owner_reply && <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-semibold text-neutral-600">Huỷ</button>}
                <button type="button" disabled={isSaving || !text.trim()} onClick={() => save(text.trim())} className="px-4 py-1.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold disabled:opacity-50">
                  Gửi phản hồi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

// Đánh giá công khai của khách về các cửa hàng: lọc chưa trả lời / theo cửa hàng, trả lời ngay tại chỗ
export const ReviewsPage = () => {
  const { data, reload: reloadBusiness } = useConsole();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') === 'unreplied' ? 'unreplied' : 'all';
  const placeId = searchParams.get('place') ?? '';
  const [state, setState] = useState({ items: [], summary: null, cursor: null, error: null, isLoading: true });

  const load = useCallback(async (before = null) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const page = await getBusinessReviewsApi({ filter, place_id: placeId || undefined, before: before ?? undefined });
      setState((prev) => ({ items: before ? [...prev.items, ...page.items] : page.items, summary: page.summary ?? prev.summary, cursor: page.next_cursor, error: null, isLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, error, isLoading: false }));
    }
  }, [filter, placeId]);

  useEffect(() => {
    load();
  }, [load]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };
  const onReplied = (id, reply) => {
    setState((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === id ? { ...item, owner_reply: reply } : item)) }));
    reloadBusiness(); // cập nhật số chưa trả lời trên menu
  };

  return (
    <div className="space-y-4">
      {state.summary && <Summary summary={state.summary} />}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-pill bg-neutral-200/70 p-0.5" role="group" aria-label="Lọc đánh giá">
          {FILTERS.map((item) => (
            <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setParam('filter', item.value === 'all' ? '' : item.value)} className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold ${filter === item.value ? 'bg-surface text-neutral-900 shadow-sm' : 'text-neutral-600'}`}>
              {item.label}{item.value === 'unreplied' && data.unreplied_reviews > 0 && ` (${data.unreplied_reviews})`}
            </button>
          ))}
        </div>
        {data.places.length > 1 && (
          <select value={placeId} onChange={(event) => setParam('place', event.target.value)} className="py-1.5 px-3 rounded-pill border border-neutral-300 bg-surface text-xs" aria-label="Cửa hàng">
            <option value="">Mọi cửa hàng</option>
            {data.places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
          </select>
        )}
      </div>

      {state.error && !state.items.length && <ErrorState error={state.error} onRetry={() => load()} />}
      {!state.isLoading && !state.error && state.items.length === 0 && (
        <p className="bg-surface rounded-card shadow-card p-8 text-center text-sm text-neutral-500">
          {filter === 'unreplied' ? 'Bạn đã trả lời hết đánh giá 👏' : 'Chưa có đánh giá công khai nào cho cửa hàng của bạn.'}
        </p>
      )}
      <ul className="space-y-3">
        {state.items.map((review) => <ReviewItem key={review.id} review={review} onReplied={onReplied} />)}
      </ul>
      {state.isLoading && <div className="h-24 rounded-card bg-neutral-200 animate-pulse" aria-hidden="true" />}
      {state.cursor && !state.isLoading && (
        <div className="text-center">
          <button type="button" onClick={() => load(state.cursor)} className="px-4 py-2 rounded-button bg-surface shadow-card text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Xem thêm</button>
        </div>
      )}
    </div>
  );
};
