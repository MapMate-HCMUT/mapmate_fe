import { HelpCircle } from 'lucide-react';

// AI hỏi lại khi yêu cầu quá chung chung (tối đa 2 câu, 1 lượt) — mỗi đáp án là 1 nút bấm gửi luôn.
export const ClarifyQuestions = ({ questions, onAnswer, isSending }) => (
  <div className="rounded-card border border-info-100 bg-info-50 p-3 space-y-2.5">
    <p className="flex items-center gap-1.5 text-sm font-semibold text-info-700">
      <HelpCircle className="w-4 h-4" /> Mình cần thêm chút thông tin để gợi ý đúng ý bạn
    </p>
    {questions.map((item) => (
      <div key={item.question} className="space-y-1.5">
        <p className="text-sm text-neutral-800">{item.question}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={isSending}
              onClick={() => onAnswer(option)}
              className="px-3 py-1 rounded-pill border border-info-100 bg-surface text-xs font-semibold text-info-700 hover:bg-info-100 disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    ))}
    <p className="text-[11px] text-neutral-500">Hoặc gõ câu trả lời của bạn — mình sẽ ghép vào yêu cầu vừa rồi.</p>
  </div>
);
