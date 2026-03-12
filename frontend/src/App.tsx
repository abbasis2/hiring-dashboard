import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import AddJob from "./pages/AddJob";
import Dashboard from "./pages/Dashboard";
import FilledPositions from "./pages/FilledPositions";
import OutstandingPositions from "./pages/OutstandingPositions";
import Positions from "./pages/Positions";
import UploadPage from "./pages/UploadPage";
import MasterFieldPage from "./pages/master/MasterFieldPage";
import MasterPagesIndex from "./pages/master/MasterPagesIndex";

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

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Layout>
        <Routes>
          <Route element={<Dashboard />} path="/" />
          <Route element={<OutstandingPositions />} path="/outstanding-positions" />
          <Route element={<FilledPositions />} path="/filled-positions" />
          <Route element={<AddJob />} path="/add-position" />
          <Route element={<Positions />} path="/positions" />
          <Route element={<UploadPage />} path="/upload" />
          <Route element={<MasterPagesIndex />} path="/master-pages" />
          <Route element={<MasterFieldPage />} path="/master-pages/:fieldKey" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
