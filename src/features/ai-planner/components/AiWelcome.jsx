import { Sparkles } from 'lucide-react';

// Màn hình đầu: giới thiệu + câu mẫu (bấm là gửi). Người dùng gõ gì cũng được, không cần theo mẫu.
export const AiWelcome = ({ examples, llmEnabled, onPick }) => (
  <div className="mx-auto max-w-xl py-8 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-primary-100 text-primary-700">
      <Sparkles className="w-6 h-6" />
    </div>
    <h1 className="mt-3 text-xl font-bold text-neutral-900">Hôm nay bạn muốn đi đâu?</h1>
    <p className="mt-1 text-sm text-neutral-500">
      Kể cho MapMate nghe: đi mấy người, khu nào, ngân sách, thích gì. Mình lên lộ trình từ hơn 25.000 địa điểm thật ở TP.HCM.
    </p>
    {!llmEnabled && <p className="mt-2 text-[11px] text-warning-700">AI đang chạy chế độ cơ bản (chưa kết nối Groq) — vẫn lên lộ trình được, câu trả lời đơn giản hơn.</p>}
    <ul className="mt-5 grid gap-2 text-left sm:grid-cols-2">
      {examples.map((example) => (
        <li key={example}>
          <button type="button" onClick={() => onPick(example)} className="h-full w-full rounded-card border border-neutral-200 bg-surface p-3 text-sm text-neutral-700 hover:border-primary-300 hover:bg-primary-50 transition">
            {example}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
