import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorPage, Home, Auth, AdminPage } from '@pages';
import { useInternet } from '@hooks';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

const App = () => {
  const isOnline = useInternet();

  if (!isOnline) {
    return <ErrorPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/error" replace />} />
    </Routes>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
