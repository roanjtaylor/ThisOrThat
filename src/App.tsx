import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { HomePage } from './pages/HomePage';
import { SetupPage } from './pages/SetupPage';
import { ComparePage } from './pages/ComparePage';
import { ResultsPage } from './pages/ResultsPage';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:branch" element={<SetupPage />} />
          <Route path="/:branch/play" element={<ComparePage />} />
          <Route path="/:branch/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
