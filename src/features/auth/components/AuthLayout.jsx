import { Map, Sparkles, Store, Trophy } from 'lucide-react';
import { Logo } from '../../../components/Logo';
import { BRAND } from '../../../config/app';
import { AuthMapBackdrop } from './AuthMapBackdrop';

const HIGHLIGHTS = [
  { icon: Sparkles, text: 'AI gợi ý lịch trình theo túi tiền', bg: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30' },
  { icon: Map, text: 'Chỉ đường xe máy, đi bộ, xe buýt & metro', bg: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/30' },
  { icon: Trophy, text: 'Check-in nhận XP, mở khóa huy hiệu', bg: 'bg-amber-400/20 text-amber-100 border-amber-300/30' },
  { icon: Store, text: 'Chủ quán: đưa cửa hàng lên bản đồ MapMate', bg: 'bg-rose-400/20 text-rose-100 border-rose-300/30' },
];

// Khung chung cho trang Đăng nhập: bản đồ TP.HCM mờ phía sau, thương hiệu bên trái (desktop), khung đăng nhập nổi bên phải.
export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="relative min-h-dvh overflow-hidden bg-[#022c22]">
    <AuthMapBackdrop />

    <div className="relative z-10 min-h-dvh flex">
      <aside data-theme="light" className="hidden lg:flex w-[46%] flex-col justify-between p-12 text-white">
        <div className="inline-flex self-start bg-surface rounded-pill px-4 py-2 shadow-card">
          <Logo size="md" />
        </div>
        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight drop-shadow-sm">{BRAND.tagline}</h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-3.5 text-white/90 text-sm font-medium">
                  <span className={`w-9 h-9 rounded-xl border backdrop-blur-sm flex items-center justify-center shrink-0 ${item.bg}`} aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} {BRAND.name} · MLAI Hackathon 2026</p>
      </aside>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <span className="inline-flex bg-surface rounded-pill px-4 py-2 shadow-card">
              <Logo size="md" />
            </span>
          </div>
          <section className="bg-surface/95 backdrop-blur-xl rounded-card shadow-[0_24px_60px_-12px_rgb(2_44_34/0.55)] ring-1 ring-white/40 p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
            <p className="mt-1 mb-6 text-sm text-neutral-500">{subtitle}</p>
            {children}
          </section>
          <div className="mt-5 text-center text-sm text-white/80">{footer}</div>
        </div>
      </main>
    </div>
  </div>
);
