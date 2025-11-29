/**
 * Página de análisis con Machine Learning
 */
import { useState, useEffect } from 'react';
import { Brain, AlertCircle, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PredictionCard from '../components/cards/PredictionCard';
import { fetchMLAnomalies, fetchAttackPredictions } from '../services/api';

const MLAnalysis = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [anomaliesData, predictionsData] = await Promise.all([
        fetchMLAnomalies(0.15),
        fetchAttackPredictions()
      ]);
      setAnomalies(anomaliesData.anomalies || []);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error cargando análisis ML:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Ejecutando modelos de Machine Learning..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="text-purple-600" />
          Análisis con Machine Learning
        </h1>
        <p className="text-gray-600 mt-2">
          Detección avanzada de anomalías y predicción de amenazas usando Isolation Forest
        </p>
      </div>

      {/* Predicciones */}
      <PredictionCard prediction={predictions} />

      {/* Anomalías detectadas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Anomalías Detectadas por ML ({anomalies.length})
        </h2>

        {anomalies.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No se detectaron anomalías significativas
          </p>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className="border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-lg font-bold text-gray-900">
                      {anomaly.ip}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {anomaly.behavioral_pattern}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      anomaly.risk_level === 'Crítico' ? 'bg-red-100 text-red-800' :
                      anomaly.risk_level === 'Alto' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {anomaly.risk_level}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Confianza: {anomaly.confidence}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600">Total Ataques</p>
                    <p className="text-xl font-bold text-red-600">{anomaly.total_attacks}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600">Puertos Únicos</p>
                    <p className="text-xl font-bold text-blue-600">{anomaly.unique_ports}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600">Tipos de Ataque</p>
                    <p className="text-xl font-bold text-purple-600">{anomaly.attack_types}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600">SCADA Target</p>
                    <p className="text-xl font-bold text-orange-600">
                      {anomaly.targets_scada ? '⚠️ SÍ' : 'NO'}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded p-3">
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    Anomaly Score (ML):
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.abs(anomaly.anomaly_score) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-mono text-purple-900">
                      {anomaly.anomaly_score.toFixed(3)}
                    </span>
                  </div>
                </div>

                {anomaly.attack_timeline && anomaly.attack_timeline.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                      Ver Timeline de Ataques ({anomaly.attack_timeline.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {anomaly.attack_timeline.map((event, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                          <span className="text-gray-600">
                            {new Date(event.timestamp).toLocaleString('es-ES')}
                          </span>
                          <span className="font-semibold">{event.type}</span>
                          <span className="text-gray-600">→ {event.target}:{event.port}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLAnalysis;
