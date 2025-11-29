/**
 * Componente de gráfico de ataques
 */
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttackChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  // Formatear datos para el gráfico
  const chartData = type === 'line' 
    ? data.map(item => ({
        time: item.timestamp || item.name,
        ataques: item.count || item.value
      }))
    : data.map(item => ({
        name: item.name,
        cantidad: item.value
      }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'line' ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ataques" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" fill="#8b5cf6" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default AttackChart;
