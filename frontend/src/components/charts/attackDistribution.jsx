/**
 * Gráfico de distribución de ataques por tipo
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AttackDistribution = ({ data }) => {
  // Transformar objeto a array para el gráfico
  const chartData = Object.entries(data || {}).map(([tipo, cantidad]) => ({
    tipo,
    cantidad
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Tipos de Ataque</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="tipo" 
            tick={{ fontSize: 11 }}
            angle={-15}
            textAnchor="end"
            height={80}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${value} ataques`, 'Cantidad']}
          />
          <Legend />
          <Bar dataKey="cantidad" name="Cantidad de Ataques" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttackDistribution;