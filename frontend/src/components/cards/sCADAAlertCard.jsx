/**
 * Card de alerta SCADA crítica
 */
import { AlertTriangle, Clock } from 'lucide-react';

const SCADAAlertCard = ({ alert }) => {
  const severityColors = {
    'Crítico': 'border-red-500 bg-red-50',
    'Alto': 'border-orange-500 bg-orange-50',
    'Medio': 'border-yellow-500 bg-yellow-50',
    'Bajo': 'border-green-500 bg-green-50',
  };

  return (
    <div className={`border-l-4 ${severityColors[alert.severity]} bg-white rounded-lg p-4 shadow-md`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-900">{alert.title}</h4>
            <span className={`badge-${alert.severity === 'Crítico' ? 'danger' : 'warning'}`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />
            <span>{alert.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SCADAAlertCard;