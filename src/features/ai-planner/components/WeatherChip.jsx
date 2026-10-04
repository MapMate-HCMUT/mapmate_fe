import { CloudRain, CloudSun } from 'lucide-react';

// Dự báo thời tiết (Open-Meteo, CC BY 4.0 — bắt buộc ghi nguồn) cho giờ đi / giờ hỏi.
export const WeatherChip = ({ weather }) => {
  const WeatherIcon = weather.rain_likely ? CloudRain : CloudSun;
  return (
    <p className={`inline-flex flex-wrap items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs ${weather.rain_likely ? 'bg-info-100 text-info-700' : 'bg-neutral-100 text-neutral-700'}`}>
      <WeatherIcon className="w-3.5 h-3.5" />
      <span>Dự báo {weather.time.slice(11)}: {weather.description}, {weather.temperature_c}°C, khả năng mưa {weather.rain_probability}%</span>
      <a href={weather.source.url} target="_blank" rel="noreferrer" className="text-[10px] text-neutral-500 hover:underline">
        {weather.source.label}
      </a>
    </p>
  );
};
