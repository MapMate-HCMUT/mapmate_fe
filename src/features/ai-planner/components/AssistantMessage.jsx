import { AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react';
import { AiPlaceList } from './AiPlaceList';
import { AiRouteOptions } from './AiRouteOptions';
import { ClarifyQuestions } from './ClarifyQuestions';
import { PipelineTrace } from './PipelineTrace';
import { PlaceAnswerCard } from './PlaceAnswerCard';
import { RefusalCard } from './RefusalCard';
import { UnderstoodCard } from './UnderstoodCard';
import { WeatherChip } from './WeatherChip';

const BULLET_TONES = {
  warning: { icon: AlertTriangle, className: 'text-warning-700' },
  tip: { icon: Lightbulb, className: 'text-neutral-600' },
};

const Bullets = ({ items, tone }) => {
  if (!items?.length) return null;
  const { icon: ToneIcon, className } = BULLET_TONES[tone];
  return (
    <ul className={`space-y-1 text-xs ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-1.5"><ToneIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />{item}</li>
      ))}
    </ul>
  );
};

// 1 câu trả lời của AI: lời tư vấn, tiêu chí đã hiểu, lộ trình / địa điểm thật, cảnh báo, gợi ý hỏi tiếp.
export const AssistantMessage = ({ message, onFollowUp, isSending }) => {
  if (message.error) {
    return (
      <div className="rounded-card bg-danger-50 p-3 text-sm text-danger-600">
        <p>{message.error}</p>
        <button type="button" disabled={isSending} onClick={() => onFollowUp(message.retryText)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline disabled:opacity-50">
          <RotateCcw className="w-3.5 h-3.5" /> Gửi lại
        </button>
      </div>
    );
  }

  const { data } = message;
  const asksBack = data.clarifying_questions?.length > 0;
  return (
    <div className="space-y-3">
      {data.refusal ? <RefusalCard refusal={data.refusal} /> : !asksBack && <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-line">{data.reply}</p>}
      {asksBack && <ClarifyQuestions questions={data.clarifying_questions} onAnswer={onFollowUp} isSending={isSending} />}
      {message.restored && data.options?.length === 0 && data.intent !== 'ask_place' && !data.refusal && !asksBack && (
        <p className="text-[11px] text-neutral-400">Lộ trình của lượt này không được lưu kèm — gửi tiếp để AI lên lại theo tiêu chí đã nhớ.</p>
      )}
      {data.place_answer && <PlaceAnswerCard answer={data.place_answer} />}
      {data.weather && <WeatherChip weather={data.weather} />}
      {data.understood && !data.refusal && <UnderstoodCard understood={data.understood} />}
      {data.options?.length > 0 && <AiRouteOptions options={data.options} criteria={data.understood.criteria} />}
      {data.places?.length > 0 && <AiPlaceList places={data.places} />}
      <Bullets items={data.warnings} tone="warning" />
      <Bullets items={data.tips} tone="tip" />
      {data.follow_up_suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.follow_up_suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isSending}
              onClick={() => onFollowUp(suggestion)}
              className="px-3 py-1 rounded-pill border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <PipelineTrace trace={data.trace} sources={data.sources} />
    </div>
  );
};
