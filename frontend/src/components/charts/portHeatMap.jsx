/**
 * Heatmap de puertos más atacados
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PortHeatmap = ({ data }) => {
  const chartData = data?.slice(0, 10).map(port => ({
    puerto: `Puerto ${port.puerto}`,
    intentos: port.total_intentos,
    servicio: port.descripcion_servicio,
    critico: port.es_scada_critico
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Puertos Más Atacados</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis 
            dataKey="puerto" 
            type="category" 
            width={100}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value, name, props) => {
              return [
                `${value} intentos`,
                `${props.payload.servicio} ${props.payload.critico ? '⚠️ CRÍTICO' : ''}`
              ];
            }}
          />
          <Bar dataKey="intentos" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.critico ? '#dc2626' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-600">Puerto SCADA Crítico</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Puerto Estándar</span>
        </div>
      </div>
    </div>
  );
};

export default PortHeatmap;