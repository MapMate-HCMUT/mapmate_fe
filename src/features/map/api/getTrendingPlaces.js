import { MOCK_PLACES } from '../../../mocks/places';

const MOCK_LATENCY_MS = 300;

// TODO: thay bằng GET /api/places/trending?city=HCM khi backend sẵn sàng.
export const getTrendingPlaces = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_PLACES), MOCK_LATENCY_MS));
