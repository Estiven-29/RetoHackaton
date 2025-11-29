/**
 * Card de recomendación de seguridad
 */
import { Shield, CheckCircle } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const priorityColors = {
    'Crítico': 'border-red-500',
    'Alto': 'border-orange-500',
    'Medio': 'border-yellow-500',
    'Bajo': 'border-green-500',
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${priorityColors[recommendation.prioridad]}`}>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Shield className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{recommendation.titulo}</h3>
              <p className="text-sm text-gray-600">{recommendation.categoria}</p>
            </div>
            <span className={`badge-${
              recommendation.prioridad === 'Crítico' ? 'danger' :
              recommendation.prioridad === 'Alto' ? 'warning' : 'info'
            }`}>
              {recommendation.prioridad}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-4">{recommendation.descripcion}</p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">Acciones recomendadas:</p>
            <ul className="space-y-2">
              {recommendation.acciones?.map((accion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{accion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {recommendation.recursos_scada && recommendation.recursos_scada.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">Recursos SCADA afectados:</p>
              <p className="text-xs text-blue-700">
                {recommendation.recursos_scada.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;