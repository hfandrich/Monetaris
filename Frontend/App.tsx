import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { LoginClient } from './pages/LoginClient';
import { LoginDebtor } from './pages/LoginDebtor';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Claims } from './pages/Claims';
import { Debtors } from './pages/Debtors';
import { DebtorDetail } from './pages/DebtorDetail';
import { Compliance } from './pages/Compliance';
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

        {/* Public Payment Page (No Auth required usually, but linked here) */}
        <Route path="/pay/:caseId" element={<Pay />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  {/* Core Admin / Agent Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      user.role === UserRole.DEBTOR ? (
                        <Navigate to="/portal/debtor" />
                      ) : (
                        <Dashboard />
                      )
                    }
                  />
                  <Route path="/claims" element={<Claims />} />
                  <Route path="/debtors" element={<Debtors />} />
                  <Route path="/debtors/:id" element={<DebtorDetail />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/import" element={<Import />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/templates" element={<Templates />} />

                  {/* Portal Routes */}
                  <Route
                    path="/portal/client"
                    element={
                      user.role === UserRole.CLIENT ? (
                        <ClientPortal />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="/portal/debtor"
                    element={
                      user.role === UserRole.DEBTOR ? (
                        <DebtorPortal />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    }
                  />

                  <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
                </Routes>
              </Layout>
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
