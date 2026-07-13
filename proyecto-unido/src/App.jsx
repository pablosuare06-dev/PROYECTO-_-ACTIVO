import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import PersonasLogin from '@/pages/PersonasLogin';
import EmpresasLogin from '@/pages/EmpresasLogin';
import PersonasVerification from '@/pages/PersonasVerification';
import EmpresasVerification from '@/pages/EmpresasVerification';
import DashboardPersonas from '@/pages/DashboardPersonas';
import DashboardEmpresas from '@/pages/DashboardEmpresas';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Panel from '@/pages/Panel';
import VerifySolicitud from '@/pages/VerifySolicitud';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pino-pers" element={<PersonasLogin />} />
      <Route path="/pino-pers-veri" element={<PersonasVerification />} />
      <Route path="/pino-princi-per" element={<DashboardPersonas />} />
      <Route path="/pino-empre-princi" element={<DashboardEmpresas />} />
      <Route path="/pino-empr" element={<EmpresasLogin />} />
      <Route path="/pino-empr-veri" element={<EmpresasVerification />} />
      {/* Rutas provenientes del proyecto pino-codigos */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-solicitud" element={<VerifySolicitud />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App