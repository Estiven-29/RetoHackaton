/**
 * Tabla de alertas recientes
 */
import { Clock, AlertCircle } from 'lucide-react';

const AlertsTable = ({ data }) => {
  const getSeverityBadge = (severity) => {
    const badges = {
      'Crítico': 'badge-danger',
      'Alto': 'badge-warning',
      'Medio': 'badge-info',
      'Bajo': 'badge-success'
    };
    return badges[severity] || 'badge-info';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={20} />
          Alertas Recientes
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo de Alerta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IP Origen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Puerto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Severidad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((alert, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={14} />
                  {new Date(alert.timestamp).toLocaleString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {alert.alerta}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {alert.ip_origen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {alert.puerto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getSeverityBadge(alert.severidad || 'Medio')}>
                    {alert.severidad || 'Medio'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;