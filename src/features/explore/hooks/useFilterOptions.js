import { useEffect, useState } from 'react';
import { getFilterOptionsApi } from '../api/placesApi';
import { FALLBACK_OPTIONS } from '../utils/filterConfig';

let cachedOptions = null; // các lựa chọn hiếm khi đổi => tải 1 lần cho cả phiên

export const useFilterOptions = () => {
  const [options, setOptions] = useState(cachedOptions ?? FALLBACK_OPTIONS);

  useEffect(() => {
    if (cachedOptions) return undefined;
    let isActive = true;
    getFilterOptionsApi()
      .then((data) => {
        cachedOptions = data;
        if (isActive) setOptions(data);
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, []);

  return options;
};
