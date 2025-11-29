/**
 * Configuración de rutas de la aplicación
 */
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PatternAnalysis from './pages/PatternAnalysis';
import SCADAAnalysis from './pages/SCADAAnalysis';
import ProfessionalRecommendations from './pages/ProfessionalRecommendations';  // ← ACTUALIZADO
import MLAnalysis from './pages/MLAnalysis';
import AutoResponse from './pages/AutoResponse';
import NetworkGraph from './pages/NetworkGraph';
import DatasetManager from './pages/DatasetManager';  // ← NUEVO

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'pattern-analysis',
        element: <PatternAnalysis />,
      },
      {
        path: 'scada-analysis',
        element: <SCADAAnalysis />,
      },
      {
        path: 'ml-analysis',
        element: <MLAnalysis />,
      },
      {
        path: 'auto-response',
        element: <AutoResponse />,
      },
      {
        path: 'network-graph',
        element: <NetworkGraph />,
      },
      {
        path: 'recommendations',  // ← ACTUALIZADO
        element: <ProfessionalRecommendations />,
      },
      {
        path: 'datasets',  // ← NUEVO
        element: <DatasetManager />,
      },
    ],
  },
]);

export default router;
