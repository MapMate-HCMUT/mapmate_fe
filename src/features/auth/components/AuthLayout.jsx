import { Map, Sparkles, Trophy } from 'lucide-react';
import { Logo } from '../../../components/Logo';
import { BRAND } from '../../../config/app';

const HIGHLIGHTS = [
  { icon: Sparkles, text: 'AI gợi ý lịch trình theo túi tiền', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
  { icon: Map, text: 'Chỉ đường xe máy, đi bộ, xe buýt & metro', bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30' },
  { icon: Trophy, text: 'Check-in nhận XP, mở khóa huy hiệu', bg: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
];

// Khung chung cho trang Đăng nhập: panel thương hiệu (desktop) + form.
export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-dvh flex bg-neutral-50">
    <aside className="hidden lg:flex w-[44%] flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white">
      <div className="inline-flex self-start bg-surface rounded-pill px-4 py-2 shadow-card">
        <Logo size="md" />
      </div>
      <div className="space-y-6">
        <h2 className="text-4xl font-extrabold tracking-tight leading-tight">{BRAND.tagline}</h2>
        <ul className="space-y-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-center gap-3.5 text-primary-50 text-sm font-medium">
                <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${item.bg}`} aria-hidden="true">
                  <Icon className="w-5 h-5" />
                </span>
                <span>{item.text}</span>
              </li>
            );
          })}
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
