/**
 * Card de predicción de ataques con ML
 */
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
  const getRiskColor = (level) => {
    const colors = {
      'Alto': 'bg-red-100 border-red-500 text-red-800',
      'Medio': 'bg-yellow-100 border-yellow-500 text-yellow-800',
      'Bajo': 'bg-green-100 border-green-500 text-green-800'
    };
    return colors[level] || 'bg-gray-100 border-gray-500 text-gray-800';
  };

  if (!prediction) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-600 p-3 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Predicción de Ataques</h3>
          <p className="text-sm text-gray-600">Próximas 6 horas (ML-Powered)</p>
        </div>
      </div>

      {/* Hora de mayor riesgo */}
      {prediction.highest_risk_hour && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-600" size={20} />
              <span className="font-semibold text-gray-900">Mayor Riesgo Detectado</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {prediction.highest_risk_hour.hour}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Probabilidad: <span className="font-bold">{prediction.highest_risk_hour.probability}%</span>
            {' | '}
            Ataques estimados: <span className="font-bold">{prediction.highest_risk_hour.predicted_attacks}</span>
          </p>
        </div>
      )}

      {/* Timeline de predicciones */}
      <div className="space-y-2">
        {prediction.next_6_hours?.map((hour, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-lg border ${getRiskColor(hour.risk_level)}`}
          >
            <div className="flex items-center gap-3">
              <Clock size={16} />
              <span className="font-mono font-semibold">{hour.hour}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {hour.predicted_attacks} ataques
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    hour.risk_level === 'Alto' ? 'bg-red-600' :
                    hour.risk_level === 'Medio' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${hour.probability}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold w-12 text-right">
                {hour.probability}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recomendación */}
      {prediction.recommendation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-300">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Recomendación: </span>
            {prediction.recommendation}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Confianza del modelo: {prediction.model_confidence}
      </div>
    </div>
  );
};

export default PredictionCard;
