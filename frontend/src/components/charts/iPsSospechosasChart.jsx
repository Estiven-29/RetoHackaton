/**
 * Gráfico de IPs sospechosas por nivel de riesgo
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IPsSospechosasChart = ({ data }) => {
  // Agrupar por nivel de riesgo
  const riskGroups = data?.reduce((acc, ip) => {
    const risk = ip.nivel_riesgo;
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(riskGroups).map(([nivel, cantidad]) => ({
    name: nivel,
    value: cantidad
  }));

  const COLORS = {
    'Crítico': '#dc2626',
    'Alto': '#f97316',
    'Medio': '#eab308',
    'Bajo': '#22c55e'
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">IPs Sospechosas por Nivel de Riesgo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} IPs`, name]}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IPsSospechosasChart;