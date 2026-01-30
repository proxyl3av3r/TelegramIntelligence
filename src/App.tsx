import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ChannelsPage } from '@/pages/ChannelsPage';
import { ChannelPage } from '@/pages/ChannelPage';
import { AdminPage } from '@/pages/AdminPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/channels" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to channels if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/channels" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/channels" 
        element={
          <ProtectedRoute>
            <ChannelsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/channel/:id" 
        element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </Router>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
