export const SubmitButton = ({ isLoading, children, loadingText = 'Đang xử lý…' }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-wait text-white rounded-button text-sm font-bold shadow-card transition"
  >
    {isLoading && <span className="w-4 h-4 rounded-pill border-2 border-white/40 border-t-white animate-spin" />}
    {isLoading ? loadingText : children}
  </button>
);
