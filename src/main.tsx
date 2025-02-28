import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from '@pages';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center" />
    <Home />
  </StrictMode>,
);
