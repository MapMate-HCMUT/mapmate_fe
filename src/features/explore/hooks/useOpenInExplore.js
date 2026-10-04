import { useNavigate } from 'react-router';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { criteriaToFilters } from '../utils/filterConfig';

// Mở "tiêu chí chuyến đi" (VD AI Planner vừa hiểu) trong trang Khám phá để người dùng tự chỉnh tiếp bằng bộ lọc.
export const useOpenInExplore = () => {
  const navigate = useNavigate();
  const replaceFilters = useExploreFilterStore((state) => state.replaceFilters);
  const setOrigin = useExploreFilterStore((state) => state.setOrigin);

  return (criteria) => {
    replaceFilters(criteriaToFilters(criteria, useExploreFilterStore.getState().filters));
    if (criteria.origin) setOrigin({ ...criteria.origin, label: criteria.origin.label ?? 'Điểm xuất phát', isDefault: false });
    navigate('/explore?tab=places');
  };
};
