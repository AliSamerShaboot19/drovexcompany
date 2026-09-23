import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider, useData } from './context/DataContext';
import AuraBackground from './components/AuraBackground';
import Preloader from './components/Preloader';
import { IconSpinner } from './components/Icons';
import Home from './pages/Home';

// /admin is a separate chunk: most visitors only ever load the public site.
const Admin = lazy(() => import('./pages/Admin'));

function RouteFallback() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100svh' }}>
      <IconSpinner size={28} />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Shell() {
  const { booted } = useData();
  return (
    <>
      <AuraBackground />
      <AnimatePresence>{!booted && <Preloader key="preloader" />}</AnimatePresence>
      {booted && (
        <>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <DataProvider>
          <BrowserRouter>
            <Shell />
          </BrowserRouter>
        </DataProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
