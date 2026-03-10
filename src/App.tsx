import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'sonner';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import JournalEditor from './pages/JournalEditor';
import JournalView from './pages/JournalView';
import PageNotFound from './lib/PageNotFound';
import ErrorBoundary from './lib/ErrorBoundary';
import { createPageUrl } from './lib/utils';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to={createPageUrl("Dashboard")} replace />} />
            <Route
              path={createPageUrl("Dashboard")}
              element={
                <Layout currentPageName="Dashboard">
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path={createPageUrl("Journal")}
              element={
                <Layout currentPageName="Journal">
                  <Journal />
                </Layout>
              }
            />
            <Route
              path={createPageUrl("JournalEditor")}
              element={
                <Layout currentPageName="JournalEditor">
                  <JournalEditor />
                </Layout>
              }
            />
            <Route
              path={createPageUrl("JournalView")}
              element={
                <Layout currentPageName="JournalView">
                  <JournalView />
                </Layout>
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </AuthProvider>
    </ErrorBoundary>
  );
}
