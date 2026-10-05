import { Icon } from './Icon';
import { VoiceButton } from './VoiceButton';

export const SearchBar = ({ value, onChange, onClear, onSubmit, placeholder = 'Bạn muốn đi đâu hôm nay?' }) => (
  <form
    role="search"
    className="relative w-full"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit?.();
    }}
  >
    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Tìm kiếm địa điểm"
      className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 border border-transparent rounded-pill text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition [&::-webkit-search-cancel-button]:hidden"
    />
    {value ? (
      <button
        type="button"
        onClick={onClear}
        aria-label="Xóa từ khóa"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-pill text-neutral-400 hover:text-neutral-700"
      >
        <Icon name="close" className="w-4 h-4" />
      </button>
    ) : (
      <VoiceButton
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
        onText={(text) => {
          onChange(text);
          onSubmit?.();
        }}
      />
    )}
  </form>
);
