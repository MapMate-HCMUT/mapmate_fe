import { Link } from 'react-router';
import { Logo } from './Logo';

// Trang tạm cho các tab chưa phát triển — vẫn giữ Logo theo yêu cầu "mỗi trang đều có logo".
export const ComingSoonPage = ({ title, description }) => (
  <section className="flex-1 overflow-y-auto bg-neutral-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-surface rounded-card shadow-card p-8 text-center">
      <div className="flex justify-center mb-5">
        <Logo size="lg" showName={false} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
      <p className="mt-2 text-neutral-500 text-sm">{description}</p>
      <span className="inline-block mt-4 px-3 py-1 rounded-pill bg-accent-100 text-accent-700 text-xs font-semibold">
        🚧 Đang phát triển
      </span>
      <Link
        to="/"
        className="mt-6 block w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold transition"
      >
        Quay về bản đồ
      </Link>
    </div>
  </section>
);
