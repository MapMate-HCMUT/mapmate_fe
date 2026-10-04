import { ArrowRight, Sparkles } from 'lucide-react';

// Màn hình đầu: giới thiệu + câu mẫu (bấm là gửi). Người dùng gõ gì cũng được, không cần theo mẫu.
export const AiWelcome = ({ examples, llmEnabled, onPick }) => (
  <div className="mx-auto max-w-xl py-4 sm:py-8 px-2 sm:px-4 text-center">
    <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-pill bg-primary-100 text-primary-700">
      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
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
      {examples.map((example) => (
        <li key={example}>
          <button
            type="button"
            onClick={() => onPick(example)}
            className="group h-full w-full rounded-card border border-neutral-200 bg-surface px-3 py-2 sm:p-3 text-xs sm:text-sm text-neutral-700 hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-900 transition flex items-center justify-between gap-2 shadow-xs"
          >
            <span className="line-clamp-2 leading-relaxed">{example}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-primary-600 shrink-0 transition" />
          </button>
        </li>
      ))}
    </ul>
  </div>
);
