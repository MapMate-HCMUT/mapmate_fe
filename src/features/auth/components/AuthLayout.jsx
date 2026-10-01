import { Logo } from '../../../components/Logo';
import { BRAND } from '../../../config/app';

const HIGHLIGHTS = [
  { emoji: '🤖', text: 'AI gợi ý lịch trình theo túi tiền' },
  { emoji: '🌊', text: 'Cảnh báo ngập & né đường ngập thời gian thực' },
  { emoji: '🏆', text: 'Check-in nhận XP, mở khóa huy hiệu' },
];

// Khung chung cho trang Đăng nhập / Đăng ký: panel thương hiệu (desktop) + form.
export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-dvh flex bg-neutral-50">
    <aside className="hidden lg:flex w-[44%] flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white">
      <div className="inline-flex self-start bg-surface rounded-pill px-4 py-2 shadow-card">
        <Logo size="md" />
      </div>
      <div className="space-y-6">
        <h2 className="text-4xl font-extrabold tracking-tight leading-tight">{BRAND.tagline}</h2>
        <ul className="space-y-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item.text} className="flex items-center gap-3 text-primary-50">
              <span className="w-9 h-9 rounded-pill bg-white/15 flex items-center justify-center" aria-hidden="true">{item.emoji}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-primary-100">© {new Date().getFullYear()} {BRAND.name} · MLAI Hackathon 2026</p>
    </aside>

    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <section className="bg-surface rounded-card shadow-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-neutral-500">{subtitle}</p>
          {children}
        </section>
        <div className="mt-5 text-center text-sm text-neutral-600">{footer}</div>
      </div>
    </main>
  </div>
);
