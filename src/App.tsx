import { QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  if (!isFetching) return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-blue-100"
    >
      <div className="h-full animate-pulse bg-blue-500" style={{ width: '100%' }} />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <GlobalLoadingBar />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
