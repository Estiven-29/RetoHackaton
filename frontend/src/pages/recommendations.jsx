/**
 * Página de recomendaciones de seguridad
 */
import { useState, useEffect } from 'react';
import { ShieldAlert, Download } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecommendationCard from '../components/cards/RecommendationCard';
import { fetchRecommendations, fetchExecutiveReport } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsData, reportData] = await Promise.all([
        fetchRecommendations(),
        fetchExecutiveReport()
      ]);
      setRecommendations(recsData);
      setReport(reportData);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ejecutivo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Generando recomendaciones..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="text-blue-600" />
            Recomendaciones de Seguridad
          </h1>
          <p className="text-gray-600 mt-2">
            Medidas estratégicas para fortalecer la infraestructura SCADA
          </p>
        </div>
        <button onClick={exportReport} className="btn-primary flex items-center gap-2">
          <Download size={18} />
          Exportar Reporte
        </button>
      </div>

      {/* Resumen ejecutivo */}
      {report && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Resumen Ejecutivo</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {report.resumen_ejecutivo}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(report.metricas_clave || {}).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p className="text-2xl font-bold text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hallazgos principales */}
      {report?.hallazgos_principales && report.hallazgos_principales.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-bold text-orange-900 mb-3">🔍 Hallazgos Principales</h3>
          <ul className="space-y-2">
            {report.hallazgos_principales.map((hallazgo, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-800">
                <span className="text-orange-600 font-bold">•</span>
                <span>{hallazgo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Recomendaciones Estratégicas</h2>
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;