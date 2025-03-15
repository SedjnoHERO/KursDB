import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ErrorPage,
  Home,
  Auth,
  AdminPage,
  TicketDetail,
  Profile,
  Catalog,
} from '@pages';
import { useInternet } from '@hooks';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@config';
import './registerSW';
import '@styles/global.scss';

const App = () => {
  const isOnline = useInternet();

  if (!isOnline) {
    return <ErrorPage />;
  }

  return <Outlet />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <AuthProvider>
          <App />
        </AuthProvider>
      }
    >
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/error" element={<ErrorPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/catalog" element={<Catalog />} />
      <Route
        path="/ticket/:id"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/error" replace />} />
    </Route>,
  ),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>,
);
