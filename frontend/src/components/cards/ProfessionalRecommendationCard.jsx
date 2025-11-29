/**
 * Card de recomendación profesional con framework badges
 */
import { Shield, BookOpen, CheckCircle, Server } from 'lucide-react';

const ProfessionalRecommendationCard = ({ recommendation }) => {
  const priorityConfig = {
    'Crítico': {
      color: 'border-red-500 bg-red-50',
      badge: 'bg-red-600 text-white',
      icon: '🔴'
    },
    'Alto': {
      color: 'border-orange-500 bg-orange-50',
      badge: 'bg-orange-600 text-white',
      icon: '🟠'
    },
    'Medio': {
      color: 'border-yellow-500 bg-yellow-50',
      badge: 'bg-yellow-600 text-white',
      icon: '🟡'
    },
    'Bajo': {
      color: 'border-green-500 bg-green-50',
      badge: 'bg-green-600 text-white',
      icon: '🟢'
    }
  };

  const config = priorityConfig[recommendation.prioridad] || priorityConfig['Medio'];

  // Extraer framework del título de categoría
  const getFrameworkBadge = (categoria) => {
    if (categoria.includes('NIST')) return { name: 'NIST CSF', color: 'bg-blue-600' };
    if (categoria.includes('ISO')) return { name: 'ISO 27001', color: 'bg-purple-600' };
    if (categoria.includes('IEC')) return { name: 'IEC 62443', color: 'bg-green-600' };
    if (categoria.includes('CIS')) return { name: 'CIS Controls', color: 'bg-orange-600' };
    return { name: 'General', color: 'bg-gray-600' };
  };

  const framework = getFrameworkBadge(recommendation.categoria);

  return (
    <div className={`border-l-4 rounded-lg p-6 shadow-md ${config.color}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${framework.color} text-white`}>
              {framework.name}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
              {config.icon} {recommendation.prioridad}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {recommendation.titulo}
          </h3>
          <p className="text-sm text-gray-600 font-semibold mb-2">
            {recommendation.categoria}
          </p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Shield className="text-blue-600" size={24} />
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        {recommendation.descripcion}
      </p>

      {/* Acciones */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-600" />
          <h4 className="font-semibold text-gray-900">Acciones Requeridas:</h4>
        </div>
        <ul className="space-y-2">
          {recommendation.acciones?.map((accion, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>{accion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recursos SCADA */}
      {recommendation.recursos_scada && recommendation.recursos_scada.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Server size={18} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">Recursos SCADA Afectados:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.recursos_scada.map((recurso, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-200"
              >
                {recurso}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalRecommendationCard;
