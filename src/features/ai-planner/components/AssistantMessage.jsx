import { AlertTriangle, Lightbulb } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { AiPlaceList } from './AiPlaceList';
import { AiRouteOptions } from './AiRouteOptions';
import { ClarifyQuestions } from './ClarifyQuestions';
import { PipelineTrace } from './PipelineTrace';
import { PlaceAnswerCard } from './PlaceAnswerCard';
import { RefusalCard } from './RefusalCard';
import { UnderstoodCard } from './UnderstoodCard';
import { WeatherChip } from './WeatherChip';

const WarningsBox = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="rounded-card border border-amber-200 bg-amber-50/90 p-3 sm:p-3.5 space-y-2 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Lưu ý & Cảnh báo</span>
      </div>
      <ul className="space-y-1.5 text-xs sm:text-[13px] text-amber-950 leading-relaxed font-medium">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TipsBox = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="rounded-card border border-primary-200/90 bg-primary-50/50 p-3 sm:p-3.5 space-y-2 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary-900 uppercase tracking-wide">
        <Lightbulb className="w-4 h-4 text-primary-600 shrink-0" />
        <span>Lời khuyên & Gợi ý từ AI</span>
      </div>
      <ul className="space-y-1.5 text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-medium">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-primary-500 font-bold shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 1 câu trả lời của AI: lời tư vấn, tiêu chí đã hiểu, lộ trình / địa điểm thật, cảnh báo, gợi ý hỏi tiếp.
export const AssistantMessage = ({ message, onFollowUp, isSending }) => {
  if (message.error) {
    // Lỗi của 1 lượt chat: báo ngay trong khung chat (không rời trang => không mất cuộc trò chuyện) + nút gửi lại
    return (
      <ErrorState
        compact
        error={{ message: message.error, kind: message.errorKind }}
        title="MapMate AI chưa trả lời được"
        onRetry={isSending ? null : () => onFollowUp(message.retryText)}
      />
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
      <WarningsBox items={data.warnings} />
      <TipsBox items={data.tips} />
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
