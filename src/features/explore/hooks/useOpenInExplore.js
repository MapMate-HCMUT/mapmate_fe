import { useNavigate } from 'react-router';
import { useExploreFilterStore } from '../stores/exploreFilterStore';

// Mở "tiêu chí chuyến đi" (VD AI Planner vừa hiểu) trong trang Khám phá để người dùng tự chỉnh tiếp bằng bộ lọc.
export const useOpenInExplore = () => {
  const navigate = useNavigate();
  const applyCriteria = useExploreFilterStore((state) => state.applyCriteria);

  return (criteria) => {
    applyCriteria(criteria);
    navigate('/explore?tab=places');
  };
};
