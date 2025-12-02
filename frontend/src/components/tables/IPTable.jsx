/**
 * Tabla de IPs sospechosas
 */
const IPTable = ({ ips }) => {
  if (!ips || ips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se encontraron IPs sospechosas
      </div>
    );
  }

  const getRiskColor = (nivel) => {
    const colors = {
      'Crítico': 'bg-red-100 text-red-800',
      'Alto': 'bg-orange-100 text-orange-800',
      'Medio': 'bg-yellow-100 text-yellow-800',
      'Bajo': 'bg-green-100 text-green-800'
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  return (
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
              Nivel de Riesgo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipos de Ataque
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Puertos Afectados
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ips.map((ip, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {ip.ip}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-blue-600">
                  {ip.total_ataques}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(ip.nivel_riesgo)}`}>
                  {ip.nivel_riesgo}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {ip.tipos_ataques?.slice(0, 3).map((tipo, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tipo}
                    </span>
                  ))}
                  {ip.tipos_ataques?.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      +{ip.tipos_ataques.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {ip.puertos_afectados?.slice(0, 4).map((puerto, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-mono"
                    >
                      {puerto}
                    </span>
                  ))}
                  {ip.puertos_afectados?.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      +{ip.puertos_afectados.length - 4}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IPTable;
