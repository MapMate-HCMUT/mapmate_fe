import { BrowserRouter } from 'react-router';
import { AppRoutes } from '../routes/AppRoutes';

export const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
