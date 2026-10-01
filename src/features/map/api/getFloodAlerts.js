import { MOCK_FLOOD_ALERTS } from '../../../mocks/floodAlerts';

const MOCK_LATENCY_MS = 300;

// TODO: thay bằng GET /api/flood/alerts?lat=&lng=&radius= khi backend sẵn sàng.
export const getFloodAlerts = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_FLOOD_ALERTS), MOCK_LATENCY_MS));
