/**
 * Tabla de IPs sospechosas
 */
import { AlertTriangle, Shield } from 'lucide-react';

const SuspiciousIPsTable = ({ data, limit = 10 }) => {
  const getRiskColor = (risk) => {
    const colors = {
      'Crítico': 'text-red-600 bg-red-50',
      'Alto': 'text-orange-600 bg-orange-50',
      'Medio': 'text-yellow-600 bg-yellow-50',
      'Bajo': 'text-green-600 bg-green-50'
    };
    return colors[risk] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={20} />
          IPs Sospechosas Detectadas
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Origen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Ataques
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipos de Ataque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel de Riesgo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puertos Afectados
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.slice(0, limit).map((ip, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {ip.ip}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-red-600">
                    {ip.total_ataques}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {ip.tipos_ataques?.slice(0, 3).map((tipo, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tipo}
                      </span>
                    ))}
                    {ip.tipos_ataques?.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{ip.tipos_ataques.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(ip.nivel_riesgo)}`}>
                    {ip.nivel_riesgo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-mono">
                    {ip.puertos_afectados?.slice(0, 5).join(', ')}
                    {ip.puertos_afectados?.length > 5 && '...'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.length > limit && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Mostrando {limit} de {data.length} IPs sospechosas
          </p>
        </div>
      )}
    </div>
  );
};

export default SuspiciousIPsTable;