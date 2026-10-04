import { ArrowRight, Sparkles } from 'lucide-react';

// Màn hình đầu: giới thiệu + câu mẫu (bấm là gửi). Người dùng gõ gì cũng được, không cần theo mẫu.
// `personalized`: gợi ý theo sở thích AI đã ghi nhớ (đứng đầu, đánh dấu ★).
export const AiWelcome = ({ examples, personalized = [], llmEnabled, onPick }) => (
  <div className="mx-auto max-w-xl py-4 sm:py-8 px-2 sm:px-4 text-center">
    <div className="relative mx-auto mb-3 sm:mb-4 w-fit">
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-md opacity-35 animate-pulse" />
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center ring-1 ring-white/40">
        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
      </div>
    </div>
    <h1 className="mt-2.5 sm:mt-3 text-lg sm:text-xl font-bold text-neutral-900">Hôm nay bạn muốn đi đâu?</h1>
    <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
      Kể cho MapMate nghe: đi mấy người, khu nào, ngân sách, thích gì. Mình lên lộ trình từ hơn 25.000 địa điểm thật ở TP.HCM.
    </p>
    {!llmEnabled && (
      <p className="mt-2 text-[11px] text-warning-700">
        AI đang chạy chế độ cơ bản — vẫn lên lộ trình được, câu trả lời đơn giản hơn.
      </p>
    )}
    <ul className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
      {[...new Set([...personalized, ...examples])].slice(0, Math.max(examples.length, personalized.length)).map((example) => (
        <li key={example}>
          <button
            type="button"
            onClick={() => onPick(example)}
            className="group h-full w-full rounded-card border border-neutral-200 bg-surface px-3 py-2 sm:p-3 text-xs sm:text-sm text-neutral-700 hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-900 transition flex items-center justify-between gap-2 shadow-xs"
          >
            <span className="line-clamp-2 leading-relaxed">{personalized.includes(example) && <span className="text-accent-500" title="Gợi ý theo sở thích của bạn">★ </span>}{example}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-primary-600 shrink-0 transition" />
          </button>
        </li>
      ))}
    </ul>
  </div>
);
