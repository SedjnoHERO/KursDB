import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorPage, Home } from '@pages';
import { useInternet } from '@hooks';

const App = () => {
  const isOnline = useInternet();
  return <StrictMode>{isOnline ? <Home /> : <ErrorPage />}</StrictMode>;
};

createRoot(document.getElementById('root')!).render(<App />);
