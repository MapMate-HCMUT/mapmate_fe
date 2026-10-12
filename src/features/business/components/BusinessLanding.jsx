import { Link } from 'react-router';
import { BarChart3, MapPinned, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessTiers } from '../hooks/useBusinessTiers';
import { TierPlans } from './TierPlans';

const STEPS = [
  { icon: Store, title: 'Đăng nhập & nhập thông tin quán', text: 'Tên, loại hình, giá, giờ mở cửa — 1 phút là xong.' },
  { icon: MapPinned, title: 'Chọn vị trí trên bản đồ', text: 'Đặt ghim đúng cửa quán để khách chỉ đường tới nơi.' },
  { icon: Sparkles, title: 'Chọn gói & lên bản đồ ngay', text: 'Cửa hàng xuất hiện trong tìm kiếm, bản đồ và bài đánh giá.' },
];

const PROMISES = [
  { icon: ShieldCheck, text: 'Kết quả được ưu tiên luôn có nhãn "Tài trợ" — người dùng biết đâu là quảng cáo.' },
  { icon: Sparkles, text: 'AI Gợi ý lộ trình giữ khách quan: không ưu tiên cửa hàng trả phí, chỉ xét chất lượng và đường đi.' },
  { icon: BarChart3, text: 'Thống kê lượt hiển thị, lượt xem, lượt chỉ đường — mỗi người chỉ tính 1 lần / ngày.' },
];

// Trang giới thiệu cho chủ cửa hàng (chưa đăng ký): cách hoạt động + 3 gói + nút đăng ký
export const BusinessLanding = () => {
  const { isAuthenticated } = useAuth();
  const { tiers, error, reload } = useBusinessTiers();
  const registerLink = isAuthenticated ? '/business/register' : '/login?as=business';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#047857] via-[#065f46] to-[#134e4a] text-white p-6 sm:p-10">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute right-10 bottom-[-6rem] w-56 h-56 rounded-full bg-accent-400/10" aria-hidden="true" />
        <p className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/10 text-xs font-semibold">
          <Store className="w-3.5 h-3.5" /> MapMate cho doanh nghiệp
        </p>
        <h1 className="relative mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl leading-tight">Đưa cửa hàng của bạn lên bản đồ đi chơi của giới trẻ TP.HCM</h1>
        <p className="relative mt-3 max-w-xl text-white/80">
          Tự cập nhật thông tin, ảnh, video; xuất hiện khi khách tìm quán gần đó; xem ai đang quan tâm tới cửa hàng của bạn.
        </p>
        <Link to={registerLink} className="relative mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-button bg-surface text-primary-800 font-bold shadow-card hover:bg-primary-50 transition">
          Đăng ký cửa hàng miễn phí →
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-bold text-neutral-900">3 bước để lên bản đồ</h2>
        <ol className="mt-3 grid sm:grid-cols-3 gap-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="bg-surface rounded-card shadow-card p-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-primary-700">
                <span className="w-6 h-6 rounded-pill bg-primary-100 flex items-center justify-center">{index + 1}</span>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <p className="mt-2 font-semibold text-neutral-900">{title}</p>
              <p className="mt-1 text-sm text-neutral-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-bold text-neutral-900">Chọn gói phù hợp</h2>
        <p className="mt-1 mb-4 text-sm text-neutral-500">Bắt đầu miễn phí, nâng gói bất cứ lúc nào.</p>
        {error ? <ErrorState error={error} onRetry={reload} /> : <TierPlans tiers={tiers} />}
        <div className="mt-5 text-center">
          <Link to={registerLink} className="inline-flex items-center gap-2 px-5 py-3 rounded-button bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-card transition">
            Bắt đầu đăng ký →
          </Link>
        </div>
      </section>

      <section className="bg-surface rounded-card shadow-card p-5">
        <h2 className="text-base font-bold text-neutral-900">Cam kết với người dùng MapMate</h2>
        <ul className="mt-3 space-y-2.5">
          {PROMISES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-2.5 text-sm text-neutral-700">
              <Icon className="w-4.5 h-4.5 mt-0.5 shrink-0 text-primary-600" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
