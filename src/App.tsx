import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { useTheme } from './hooks/useTheme';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CRIntakePage = lazy(() => import('./pages/CRIntakePage'));
const DraftReviewPage = lazy(() => import('./pages/DraftReviewPage'));
const FieldBuilderPage = lazy(() => import('./pages/FieldBuilderPage'));
const ChecklistPage = lazy(() => import('./pages/ChecklistPage'));
const SampleLibraryPage = lazy(() => import('./pages/SampleLibraryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export default function App() {
  const { theme, setTheme, density, setDensity } = useTheme();

  return (
    <div className="min-h-screen bg-canvas-light text-texttone-primaryLight dark:bg-canvas-dark dark:text-texttone-primaryDark">
      <a
        className="sr-only z-[60] rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Skip to main content
      </a>
      <Sidebar density={density} setTheme={setTheme} theme={theme} />
      <main className="min-h-screen lg:pl-72" id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="p-6 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">Loading workspace...</div>}>
          <Routes>
            <Route element={<Dashboard />} path="/" />
            <Route element={<CRIntakePage />} path="/intake" />
            <Route element={<DraftReviewPage />} path="/draft" />
            <Route element={<DraftReviewPage />} path="/draft/:draftId" />
            <Route element={<FieldBuilderPage />} path="/fields" />
            <Route element={<ChecklistPage />} path="/checklist" />
            <Route element={<SampleLibraryPage />} path="/samples" />
            <Route element={<SettingsPage density={density} setDensity={setDensity} setTheme={setTheme} theme={theme} />} path="/settings" />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
