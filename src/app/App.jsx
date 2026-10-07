import { BrowserRouter } from 'react-router';
import { AppRoutes } from '../routes/AppRoutes';
import { ErrorBoundary } from './ErrorBoundary';
import { OfflineGate } from './OfflineGate';

export const App = () => (
  <BrowserRouter>
    <ErrorBoundary fullScreen>
      <OfflineGate>
        <AppRoutes />
      </OfflineGate>
    </ErrorBoundary>
  </BrowserRouter>
);
