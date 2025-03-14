import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorPage, Home, Auth, AdminPage, TicketDetail } from '@pages';
import { useInternet } from '@hooks';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import './registerSW';

const App = () => {
  const isOnline = useInternet();

  if (!isOnline) {
    return <ErrorPage />;
  }

  return <Outlet />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/ticket/:id" element={<TicketDetail />} />
      <Route path="*" element={<Navigate to="/error" replace />} />
    </Route>,
  ),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
