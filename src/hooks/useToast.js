import { useToastStore } from '../stores/toastStore';

export const useToast = () => {
  const toast = useToastStore((state) => state.toast);
  const showToast = useToastStore((state) => state.showToast);
  const hideToast = useToastStore((state) => state.hideToast);
  return { toast, showToast, hideToast };
};
