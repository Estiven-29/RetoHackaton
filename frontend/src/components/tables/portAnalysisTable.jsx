/**
 * Tabla de análisis de puertos
 */
import { Server, AlertOctagon } from 'lucide-react';

const PortAnalysisTable = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Server className="text-blue-600" size={20} />
          Análisis de Puertos Atacados
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Puerto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intentos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Protocolos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((port, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    {port.puerto}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {port.descripcion_servicio || 'Desconocido'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-red-600">
                    {port.total_intentos}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {port.protocolos?.map((proto, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {proto}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {port.es_scada_critico ? (
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="text-red-600" size={16} />
                      <span className="text-xs font-semibold text-red-600">
                        CRÍTICO SCADA
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortAnalysisTable;