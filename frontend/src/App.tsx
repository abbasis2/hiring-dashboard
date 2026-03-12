import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import AddJob from "./pages/AddJob";
import Dashboard from "./pages/Dashboard";
import FilledPositions from "./pages/FilledPositions";
import OutstandingPositions from "./pages/OutstandingPositions";
import Positions from "./pages/Positions";
import UploadPage from "./pages/UploadPage";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route element={<Dashboard />} path="/" />
              <Route element={<OutstandingPositions />} path="/outstanding-positions" />
              <Route element={<FilledPositions />} path="/filled-positions" />
              <Route element={<AddJob />} path="/add-position" />
              <Route element={<Positions />} path="/positions" />
              <Route element={<UploadPage />} path="/upload" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
