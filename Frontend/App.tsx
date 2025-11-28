import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { LoginClient } from './pages/LoginClient';
import { LoginDebtor } from './pages/LoginDebtor';
import { Landing } from './pages/Landing';
import { Datenschutz } from './pages/Datenschutz';
import { Impressum } from './pages/Impressum';
import { AGB } from './pages/AGB';
import { PasswortVergessen } from './pages/PasswortVergessen';
import { Dashboard } from './pages/Dashboard';
import { Claims } from './pages/Claims';
import { Debtors } from './pages/Debtors';
import { DebtorDetail } from './pages/DebtorDetail';
import { Import } from './pages/Import';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Settings } from './pages/Settings';
import { Templates } from './pages/Templates';
import { Pay } from './pages/Pay';
import { ClientPortal } from './pages/ClientPortal';
import { DebtorPortal } from './pages/DebtorPortal';
import { authService } from './services/authService';
import { User, UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode }> = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Layout Wrapper for protected routes
const ProtectedLayout: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout}>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user, isAuthenticated } = authService.checkSession();
    if (isAuthenticated && user) {
      setUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2fcf8] dark:bg-[#000]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-monetaris-200 border-t-monetaris-600 animate-spin mb-4"></div>
          <p className="text-monetaris-800 dark:text-monetaris-500 font-display font-semibold animate-pulse">
            Lade Monetaris Enterprise...
          </p>
        </div>
      </div>
    );

  const getHomeRoute = () => {
    if (!user) return '/';
    if (user.role === UserRole.CLIENT) return '/portal/client';
    if (user.role === UserRole.DEBTOR) return '/portal/debtor';
    return '/dashboard';
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to={getHomeRoute()} replace /> : <Landing />} />

        {/* Legal Pages (Public) */}
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
        <Route path="/passwort-vergessen" element={<PasswortVergessen />} />

        {/* Separated Login Routes */}
        <Route
          path="/login"
          element={
            user ? <Navigate to={getHomeRoute()} replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/client-login"
          element={
            user ? <Navigate to={getHomeRoute()} replace /> : <LoginClient onLogin={handleLogin} />
          }
        />
        <Route
          path="/resolve"
          element={
            user ? <Navigate to={getHomeRoute()} replace /> : <LoginDebtor onLogin={handleLogin} />
          }
        />

        {/* Public Payment Page */}
        <Route path="/pay/:caseId" element={<Pay />} />

        {/* Protected Routes with Layout */}
        <Route element={user ? <ProtectedLayout user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          <Route
            path="/dashboard"
            element={
              user?.role === UserRole.DEBTOR ? (
                <Navigate to="/portal/debtor" />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route path="/claims" element={<Claims />} />
          <Route path="/debtors" element={<Debtors />} />
          <Route path="/debtors/:id" element={<DebtorDetail />} />
          <Route path="/import" element={<Import />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/templates" element={<Templates />} />

          {/* Portal Routes */}
          <Route
            path="/portal/client"
            element={
              user?.role === UserRole.CLIENT ? (
                <ClientPortal />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/portal/debtor"
            element={
              user?.role === UserRole.DEBTOR ? (
                <DebtorPortal />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
