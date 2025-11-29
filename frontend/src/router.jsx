import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PatternAnalysis from './pages/PatternAnalysis';
import SCADAAnalysis from './pages/SCADAAnalysis';
import Recommendations from './pages/Recommendations';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'pattern-analysis', element: <PatternAnalysis /> },
      { path: 'scada-analysis', element: <SCADAAnalysis /> },
      { path: 'recommendations', element: <Recommendations /> },
    ],
  },
]);

export default router;