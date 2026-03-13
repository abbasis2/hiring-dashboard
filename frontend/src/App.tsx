import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import AddJob from "./pages/AddJob";
import Dashboard from "./pages/Dashboard";
import FilledPositions from "./pages/FilledPositions";
import OutstandingPositions from "./pages/OutstandingPositions";
import Positions from "./pages/Positions";
import RecruitingDropouts from "./pages/RecruitingDropouts";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import MasterFieldPage from "./pages/master/MasterFieldPage";
import MasterPagesIndex from "./pages/master/MasterPagesIndex";
import UsersPage from "./pages/UsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card-shell w-full max-w-sm text-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading session...</p>
      </div>
    </div>
  );
}

function PublicOnly() {
  const auth = useAuth();
  if (auth.isLoading) {
    return <FullscreenLoader />;
  }
  if (auth.isAuthenticated) {
    return <Navigate replace to="/" />;
  }
  return <Outlet />;
}

function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) {
    return <FullscreenLoader />;
  }
  if (!auth.isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }
  return <Outlet />;
}

function RequireSuperAdmin() {
  const auth = useAuth();
  if (!auth.isSuperAdmin) {
    return <Navigate replace to="/" />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<SignupPage />} path="/signup" />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<OutstandingPositions />} path="/outstanding-positions" />
            <Route element={<FilledPositions />} path="/filled-positions" />
            <Route element={<RecruitingDropouts />} path="/recruiting-dropouts" />
            <Route element={<AddJob />} path="/add-position" />
            <Route element={<Positions />} path="/positions" />
            <Route element={<UploadPage />} path="/upload" />
            <Route element={<MasterPagesIndex />} path="/master-pages" />
            <Route element={<MasterFieldPage />} path="/master-pages/:fieldKey" />

            <Route element={<RequireSuperAdmin />}>
              <Route element={<UsersPage />} path="/users" />
            </Route>
          </Route>
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
