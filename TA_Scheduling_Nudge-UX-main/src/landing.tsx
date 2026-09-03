import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@eightfold.ai/octuple/lib/octuple.css';
import './index.css';
import LandingPage from './LandingPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
