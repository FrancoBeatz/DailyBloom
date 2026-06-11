import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProductivityProvider } from './lib/ProductivityContext';
import { Toaster } from 'sonner';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import DailyFocus from './pages/DailyFocus';
import DeveloperMatrix from './pages/DeveloperMatrix';
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
        <ProductivityProvider>
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
                path={createPageUrl("DailyFocus")}
                element={
                  <Layout currentPageName="DailyFocus">
                    <DailyFocus />
                  </Layout>
                }
              />
              <Route
                path={createPageUrl("DeveloperMatrix")}
                element={
                  <Layout currentPageName="DeveloperMatrix">
                    <DeveloperMatrix />
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
          <Toaster 
            position="bottom-right" 
            theme="dark" 
            closeButton
            toastOptions={{
              style: {
                background: '#0d0f12',
                border: '1px solid rgba(197, 165, 114, 0.2)',
                color: '#fdfaf5',
                fontFamily: 'sans-serif'
              }
            }} 
          />
        </ProductivityProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
