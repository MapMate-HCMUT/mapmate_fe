import { Link } from 'react-router';
import { ArrowRight, Bus, CheckCircle2, Coffee, Footprints, MapPin, SendHorizontal, Sparkles, Store, UtensilsCrossed } from 'lucide-react';
import { Logo } from '../../../components/Logo';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { BRAND } from '../../../config/app';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAuth } from '../../../hooks/useAuth';
import { AuthMapBackdrop } from '../../auth';
import { getPublicStatsApi } from '../api/landingApi';
import { FEATURES, SLOGAN, STAT_ITEMS, STEPS } from './landingContent';

// Đăng nhập xong vào thẳng trang chủ Khám phá
const LOGIN_PATH = `/login?redirect=${encodeURIComponent('/')}`;
const formatCount = (value) => (typeof value === 'number' ? value.toLocaleString('vi-VN') : '—');
const formatTime = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
// Khung nội dung chung: trải gần sát mép màn hình (không giới hạn bề rộng), chỉ chừa lề tăng dần theo kích thước màn hình
const CONTAINER = 'w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24';
const NAV_LINKS = [
  { href: '#tinh-nang', label: 'Tính năng' },
  { href: '#con-so', label: 'Số liệu' },
  { href: '#cach-dung', label: 'Hướng dẫn' },
];

const PrimaryCta = ({ isAuthenticated, className = '' }) => (
  <Link
    to={isAuthenticated ? '/' : LOGIN_PATH}
    className={`inline-flex items-center justify-center gap-2 rounded-button bg-primary-600 px-6 py-3 text-base font-bold text-white shadow-card-hover transition hover:bg-primary-700 ${className}`}
  >
    {isAuthenticated ? 'Vào ứng dụng' : 'Bắt đầu miễn phí'}
    <ArrowRight className="w-5 h-5" aria-hidden="true" />
  </Link>
);

const Header = ({ isAuthenticated }) => (
  <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface/90 backdrop-blur-md">
    <div className={`${CONTAINER} flex h-16 items-center justify-between gap-4`}>
      <Logo size="md" />
      <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-neutral-600" aria-label="Mục trên trang">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-primary-700 transition">{link.label}</a>
        ))}
        <Link to="/for-business" className="hover:text-primary-700 transition">Cho chủ quán</Link>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          to={isAuthenticated ? '/' : LOGIN_PATH}
          className="rounded-button bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          {isAuthenticated ? 'Vào ứng dụng' : 'Đăng nhập'}
        </Link>
      </div>
    </div>
  </header>
);

// Minh hoạ kết quả AI Gợi ý: tuyến đường vẽ thẳng lên nền bản đồ của phần đầu trang (ví dụ cố định — không phải dữ liệu người dùng)
const PREVIEW_STOPS = [
  { time: '18:30', name: 'Nhà hàng món Việt', meta: 'Bữa tối · ~250k', icon: UtensilsCrossed, tone: 'bg-warning-100 text-warning-700' },
  { time: '20:05', name: 'Phố đi bộ Nguyễn Huệ', meta: 'Dạo phố · miễn phí', icon: Footprints, tone: 'bg-info-100 text-info-700' },
  { time: '21:10', name: 'Cà phê rooftop view sông', meta: 'Đồ uống · ~90k', icon: Coffee, tone: 'bg-accent-100 text-accent-800' },
];
// Khung vẽ cố định 580 × 440px: toạ độ ghim + vị trí nhãn sắp sẵn để nhãn không đè nhau / không đè tuyến đường
const ROUTE_BOX = { width: 580, height: 440 };
const PREVIEW_PINS = [
  { x: 60, y: 300, label: { left: -36, top: 334 } }, // nhãn dưới ghim 1 (lệch trái)
  { x: 300, y: 150, label: { right: 580 - 300 + 28, top: 126 } }, // nhãn bên trái ghim 2
  { x: 520, y: 290, label: { right: -10, top: 334 } }, // nhãn dưới ghim 3 (lệch phải) — cách nhãn 1 ~60px
];
const ROUTE_PATH = 'M60 300 C 140 292, 200 150, 300 150 S 460 290, 520 290';

const GlassPrompt = () => (
  <div className="flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/15 py-2.5 pl-3.5 pr-2.5 text-white shadow-[0_16px_40px_-16px_rgb(0_0_0/0.5)] backdrop-blur-md">
    <Sparkles className="w-4.5 h-4.5 shrink-0 text-emerald-300" aria-hidden="true" />
    <p className="min-w-0 flex-1 text-sm font-medium leading-snug">Tối nay 2 người hẹn hò ở Quận 1, khoảng 500k/người</p>
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-[#022c22]" aria-hidden="true">
      <SendHorizontal className="w-4 h-4" />
    </span>
  </div>
);

const GlassSummary = () => (
  <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-white/25 bg-white/15 px-4 py-2.5 text-sm text-white/85 backdrop-blur-md">
    <CheckCircle2 className="w-4 h-4 text-emerald-300" aria-hidden="true" />
    <span><strong className="text-white">3h25</strong> · 2,1 km · <strong className="text-white">340k</strong>/người · về trước 22:00</span>
  </p>
);

const StopLabel = ({ stop, index }) => {
  const Icon = stop.icon;
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 py-2 pl-2 pr-3.5 shadow-[0_14px_36px_-12px_rgb(2_44_34/0.7)] backdrop-blur-sm">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stop.tone}`} aria-hidden="true">
        <Icon className="w-4.5 h-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-sm font-semibold text-neutral-900">{stop.name}</span>
        <span className="block whitespace-nowrap text-xs text-neutral-500">{stop.meta}</span>
      </span>
      <span className="ml-1 rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-bold tabular-nums text-primary-700">{stop.time}</span>
      <span className="sr-only">Điểm {index + 1}</span>
    </div>
  );
};

const prefersReducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const AiPreview = () => {
  const reduceMotion = prefersReducedMotion();
  return (
  <div data-theme="light" className="w-full">
    {/* Màn rộng: tuyến đường + 3 ghim vẽ trên nền bản đồ */}
    <div className="relative mx-auto hidden xl:block" style={{ width: ROUTE_BOX.width, height: ROUTE_BOX.height }}>
      <div className="absolute inset-x-0 top-0"><GlassPrompt /></div>
      <svg viewBox={`0 0 ${ROUTE_BOX.width} ${ROUTE_BOX.height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Tuyến đường "tự vẽ" từ trái sang phải khi mở trang (máy bật giảm chuyển động => hiện ngay) */}
        <defs>
          <clipPath id="landing-route-reveal">
            <rect x="0" y="0" width={reduceMotion ? ROUTE_BOX.width : 0} height={ROUTE_BOX.height}>
              {!reduceMotion && <animate attributeName="width" from="0" to={ROUTE_BOX.width} begin="0.4s" dur="2.4s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.25 0.1 0.25 1" />}
            </rect>
          </clipPath>
        </defs>
        <g clipPath="url(#landing-route-reveal)">
          <path d={ROUTE_PATH} fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="11" strokeLinecap="round" />
          <path d={ROUTE_PATH} fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
      {PREVIEW_PINS.map((pin, index) => (
        <span key={pin.x}>
          <span
            className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-primary-600 text-sm font-extrabold text-white shadow-lg ring-4 ring-white"
            style={{ left: pin.x, top: pin.y }}
          >
            {index + 1}
          </span>
          <span className="absolute" style={pin.label}>
            <StopLabel stop={PREVIEW_STOPS[index]} index={index} />
          </span>
        </span>
      ))}
      <div className="absolute inset-x-0 bottom-0 flex justify-center"><GlassSummary /></div>
    </div>

    {/* Màn nhỏ hơn: danh sách gọn */}
    <div className="mx-auto max-w-lg space-y-3 xl:hidden">
      <GlassPrompt />
      <ol className="space-y-2">
        {PREVIEW_STOPS.map((stop, index) => (
          <li key={stop.time} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-primary-600 text-xs font-extrabold text-white ring-2 ring-white">{index + 1}</span>
            <div className="min-w-0 flex-1 [&>div]:w-full"><StopLabel stop={stop} index={index} /></div>
          </li>
        ))}
      </ol>
      <GlassSummary />
    </div>
  </div>
  );
};

const Hero = ({ isAuthenticated, stats }) => (
  <section className="relative overflow-hidden bg-[#022c22]">
    <AuthMapBackdrop />
    <div data-theme="light" className={`${CONTAINER} relative z-10 grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] xl:gap-16`}>
      <div className="text-white">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Dành cho người đi chơi ở TP.HCM
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl">
          {BRAND.name}
          <span className="block text-emerald-300">bạn đồng hành trên mọi hành trình</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg xl:text-xl">
          Tìm chỗ ăn chơi hợp túi tiền, để AI lên lộ trình trong vài giây, rồi chỉ đường bằng xe máy, xe buýt hay metro — tất cả trong một ứng dụng.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PrimaryCta isAuthenticated={isAuthenticated} />
          <a href="#tinh-nang" className="inline-flex items-center rounded-button border border-white/30 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10">
            Xem tính năng
          </a>
        </div>
        {stats && (
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/75">
            <span><strong className="text-white">{formatCount(stats.places)}</strong> địa điểm</span>
            <span><strong className="text-white">{formatCount(stats.transit_routes)}</strong> tuyến buýt & metro</span>
            <span><strong className="text-white">{formatCount(stats.users)}</strong> người dùng</span>
          </p>
        )}
      </div>
      <AiPreview />
    </div>
  </section>
);

const StatsSection = ({ data, isLoading, error }) => (
  <section id="con-so" className="scroll-mt-20 bg-surface">
    <div className={`${CONTAINER} py-16 lg:py-20`}>
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">MapMate qua những con số</h2>
        <p className="mt-2 text-neutral-600">
          Số liệu thật, đếm trực tiếp từ hệ thống{data?.updated_at ? ` — cập nhật lúc ${formatTime(data.updated_at)}` : ''}.
        </p>
      </div>
      {error && !data ? (
        <p className="mt-8 text-sm text-neutral-500">Chưa tải được số liệu lúc này — bạn thử tải lại trang sau nhé.</p>
      ) : (
        <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="rounded-card border border-neutral-200 bg-neutral-50 p-5">
              <dt className="text-sm font-semibold text-neutral-600">{item.label}</dt>
              <dd className="mt-2 text-3xl font-extrabold tracking-tight text-primary-700 sm:text-4xl">
                {isLoading && !data ? <span className="inline-block h-9 w-24 animate-pulse rounded-input bg-neutral-200" aria-label="Đang tải" /> : formatCount(data?.[item.key])}
              </dd>
              <dd className="mt-1 text-xs text-neutral-500">{item.hint}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="tinh-nang" className="scroll-mt-20 bg-neutral-50">
    <div className={`${CONTAINER} py-16 lg:py-20`}>
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Mọi thứ cho một chuyến đi chơi</h2>
        <p className="mt-2 text-neutral-600">Từ lúc nghĩ "tối nay đi đâu" tới lúc về tới nhà.</p>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="rounded-card border border-neutral-200 bg-surface p-5 shadow-card">
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.tone}`} aria-hidden="true">
                <Icon className="w-5.5 h-5.5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{feature.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

const StepsSection = () => (
  <section id="cach-dung" className="scroll-mt-20 bg-surface">
    <div className={`${CONTAINER} py-16 lg:py-20`}>
      <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Bắt đầu trong 3 bước</h2>
      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative rounded-card border border-neutral-200 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-600 text-sm font-extrabold text-white">{index + 1}</span>
            <h3 className="mt-4 font-bold text-neutral-900">{step.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col items-start gap-4 rounded-card border border-secondary-200 bg-secondary-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Store className="mt-0.5 w-6 h-6 shrink-0 text-secondary-700" aria-hidden="true" />
          <div>
            <p className="font-bold text-neutral-900">Bạn có quán ăn, quán cà phê, khu vui chơi?</p>
            <p className="text-sm text-neutral-600">Đưa cửa hàng lên bản đồ MapMate, tạo khuyến mãi và voucher để khách tìm tới bạn.</p>
          </div>
        </div>
        <Link to="/for-business" className="shrink-0 rounded-button border border-secondary-300 bg-surface px-4 py-2 text-sm font-bold text-secondary-700 transition hover:bg-secondary-100">
          Dành cho chủ quán
        </Link>
      </div>
    </div>
  </section>
);

const FinalCta = ({ isAuthenticated }) => (
  <section className="relative overflow-hidden bg-[#022c22]">
    <div data-theme="light" className={`${CONTAINER} flex flex-col items-center gap-6 py-16 text-center lg:py-20`}>
      <Bus className="w-10 h-10 text-emerald-300" aria-hidden="true" />
      <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{SLOGAN}</h2>
      <p className="max-w-xl text-white/80">Đăng nhập để lưu lộ trình, hỏi AI, săn voucher và chia sẻ với bạn bè.</p>
      <PrimaryCta isAuthenticated={isAuthenticated} />
    </div>
  </section>
);

/** Trang giới thiệu (/welcome) — công khai; bấm logo ở mọi trang sẽ về đây. Dùng app phải đăng nhập. */
export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const stats = useAsyncData(getPublicStatsApi, 'public-stats');

  return (
    <div className="min-h-dvh bg-surface">
      <Header isAuthenticated={isAuthenticated} />
      <main>
        <Hero isAuthenticated={isAuthenticated} stats={stats.data} />
        <StatsSection data={stats.data} isLoading={stats.isLoading} error={stats.error} />
        <FeaturesSection />
        <StepsSection />
        <FinalCta isAuthenticated={isAuthenticated} />
      </main>
      <footer className="border-t border-neutral-200 bg-surface">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-neutral-500`}>
          <span>© {new Date().getFullYear()} {BRAND.name} · MLAI Hackathon 2026</span>
          <span>Dữ liệu bản đồ © Goong · © OpenStreetMap · Overture Maps</span>
        </div>
      </footer>
    </div>
  );
};
