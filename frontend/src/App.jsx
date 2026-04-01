import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, Show } from '@clerk/react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import ResultsPage from './pages/ResultsPage';
import TimelinePage from './pages/TimelinePage';
import ChatPage from './pages/ChatPage';
import IngredientScanner from './pages/IngredientScanner';
import AdminPage from './pages/AdminPage';
import AdminUserDetail from './pages/AdminUserDetail';

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Area */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Routes directly guarded by Clerk state mapping */}
        <Route path="/dashboard" element={
          isSignedIn ? <Dashboard /> : <Navigate to="/" />
        } />
        <Route path="/scanner" element={
          isSignedIn ? <ScannerPage /> : <Navigate to="/" />
        } />
        <Route path="/results/:scanId" element={
          isSignedIn ? <ResultsPage /> : <Navigate to="/" />
        } />
        <Route path="/timeline" element={
          isSignedIn ? <TimelinePage /> : <Navigate to="/" />
        } />
        <Route path="/chat" element={
          isSignedIn ? <ChatPage /> : <Navigate to="/" />
        } />
        <Route path="/scan-ingredient" element={
          isSignedIn ? <IngredientScanner /> : <Navigate to="/" />
        } />
        <Route path="/admin" element={
          isSignedIn ? <AdminPage /> : <Navigate to="/" />
        } />
        <Route path="/admin/user/:id" element={
          isSignedIn ? <AdminUserDetail /> : <Navigate to="/" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
