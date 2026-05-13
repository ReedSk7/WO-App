import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CRIntakePage from './pages/CRIntakePage';
import DraftReviewPage from './pages/DraftReviewPage';
import FieldBuilderPage from './pages/FieldBuilderPage';
import ChecklistPage from './pages/ChecklistPage';
import SampleLibraryPage from './pages/SampleLibraryPage';
import SettingsPage from './pages/SettingsPage';
import { Sidebar } from './components/layout/Sidebar';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme, density, setDensity } = useTheme();

  return (
    <div className="min-h-screen bg-canvas-light text-texttone-primaryLight dark:bg-canvas-dark dark:text-texttone-primaryDark">
      <Sidebar density={density} setTheme={setTheme} theme={theme} />
      <main className="min-h-screen lg:pl-72">
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
      </main>
    </div>
  );
}
