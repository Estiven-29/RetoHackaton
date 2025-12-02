import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

const ThreatTimeline = ({ data, loading = false }) => {
  // Transformar datos para el gráfico
  const chartData = data?.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    ataques: item.count,
    ...item.ataques_detallados
  })) || [];

  if (loading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-6 w-48 rounded mb-4"></div>
        <div className="skeleton h-64 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="card p-6 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Timeline de Amenazas</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Total de Ataques</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAtaques" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
            labelStyle={{ fontWeight: '600', color: '#374151' }}
            formatter={(value) => [`${value} ataques`, 'Cantidad']}
          />
          <Legend />
          <Area type="monotone" dataKey="ataques" stroke="#3b82f6" fill="url(#colorAtaques)" strokeWidth={2} />
          <Line 
            type="monotone" 
            dataKey="ataques" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
            name="Total Ataques"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Período: Últimas 24 horas</span>
        <span>Intervalo: 1 hora</span>
      </div>
    </div>
  );
};

export default ThreatTimeline;