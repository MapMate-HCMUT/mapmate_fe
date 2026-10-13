import { useState } from 'react';
import { Info } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { changeTierApi } from '../api/businessApi';
import { TierPlans } from '../components/TierPlans';
import { UsageMeter } from '../components/UsageMeter';
import { useBusinessTiers } from '../hooks/useBusinessTiers';
import { useConsole } from '../hooks/useConsole';
import { formatBytes } from '../utils/businessConfig';

const TIER_ORDER = ['basic', 'growth', 'premium'];

// Gói dịch vụ: mức sử dụng + đổi gói (bản demo đổi ngay; hạ gói khi đang vượt mức => server chặn + nói rõ cần gỡ gì)
export const PlansPage = () => {
  const { data, reload } = useConsole();
  const { tiers, billingMode, error, reload: reloadTiers } = useBusinessTiers();
  const [busyTier, setBusyTier] = useState(null);
  const [formError, setFormError] = useState('');
  const { showToast } = useToast();
  const current = data.tier.value;

  const change = async (tier) => {
    const target = tiers.find((item) => item.value === tier);
    const isUpgrade = TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(current);
    if (!window.confirm(`${isUpgrade ? 'Nâng' : 'Chuyển'} sang gói ${target.label}${billingMode === 'demo' ? ' (bản demo — chưa thu phí)' : ''}?`)) return;
    setBusyTier(tier);
    setFormError('');
    try {
      await changeTierApi(tier);
      showToast(`Đã chuyển sang gói ${target.label}`);
      reload();
    } catch (changeError) {
      setFormError(changeError.message);
    } finally {
      setBusyTier(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="bg-surface rounded-card shadow-card p-4 sm:p-5 grid sm:grid-cols-2 gap-5">
        <UsageMeter label="Cửa hàng" used={data.usage.places} total={data.usage.max_places} warn={false} />
        <UsageMeter label="Ảnh & video" used={data.usage.storage_used_bytes} total={data.usage.storage_bytes} format={formatBytes} />
      </section>
      {billingMode === 'demo' && (
        <p className="flex gap-2 rounded-input bg-info-50 border border-info-100 px-3 py-2 text-xs text-info-700">
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          Bản demo: đổi gói có hiệu lực ngay, chưa thu phí. Khi tích hợp cổng thanh toán, gói chỉ đổi sau khi thanh toán thành công.
        </p>
      )}
      <FormAlert message={formError} />
      {error ? (
        <ErrorState error={error} onRetry={reloadTiers} />
      ) : (
        <TierPlans tiers={tiers} variant="manage" current={current} busyTier={busyTier} onAction={change} />
      )}
    </div>
  );
};
