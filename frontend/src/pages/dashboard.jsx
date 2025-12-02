/**
 * Página principal del dashboard
 */
import { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Database 
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/cards/StatCard';
import IPTable from '../components/tables/IPTable';
import AttackChart from '../components/charts/AttackChart';
import { 
  fetchDashboardStats,
  fetchSuspiciousIPs,
  fetchTimeline 
} from '../services/api';
import { useDataset } from '../context/DatasetContext';

const Dashboard = () => {
  const { activeDatasetId, activeDatasetInfo } = useDataset();
  const [stats, setStats] = useState(null);
  const [suspiciousIPs, setSuspiciousIPs] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeDatasetId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, ipsData, timelineData] = await Promise.all([
        fetchDashboardStats(10, activeDatasetId),
        fetchSuspiciousIPs(10, 5, activeDatasetId),
        fetchTimeline('H', activeDatasetId)
      ]);
      
      setStats(statsData);
      setSuspiciousIPs(ipsData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando análisis del dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={64} />
        <p className="text-gray-600">Error al cargar los datos del dashboard</p>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge de dataset activo */}
      {activeDatasetInfo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="text-blue-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                📊 Analizando: {activeDatasetInfo.original_name}
              </p>
              <p className="text-xs text-blue-700">
                {activeDatasetInfo.records.toLocaleString()} registros • Subido el {new Date(activeDatasetInfo.uploaded_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
        <p className="text-gray-600 mt-2">
          Vista general de amenazas detectadas en la infraestructura SCADA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Alertas"
          value={stats.total_logs}
          icon={Activity}
          color="blue"
          trend={stats.alert_summary?.tendencia}
        />
        <StatCard
          title="IPs Sospechosas"
          value={stats.ips_sospechosas?.length || 0}
          icon={Shield}
          color="red"
        />
        <StatCard
          title="Alertas Críticas"
          value={stats.alert_summary?.alertas_criticas || 0}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Tipos de Ataque"
          value={Object.keys(stats.distribucion_ataques || {}).length}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Período Analizado */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Período Analizado</h3>
        <p className="text-xs text-gray-600">
          <span className="font-mono">
            {new Date(stats.periodo_analizado.inicio).toLocaleString('es-ES')}
          </span>
          {' → '}
          <span className="font-mono">
            {new Date(stats.periodo_analizado.fin).toLocaleString('es-ES')}
          </span>
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Timeline de Ataques
          </h2>
          <AttackChart data={timeline} type="line" />
        </div>

        {/* Distribución de Ataques */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Distribución de Ataques
          </h2>
          <AttackChart 
            data={Object.entries(stats.distribucion_ataques || {}).map(([name, value]) => ({
              name,
              value
            }))} 
            type="bar" 
          />
        </div>
      </div>

      {/* IPs Sospechosas Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          IPs Más Sospechosas
        </h2>
        <IPTable ips={suspiciousIPs} />
      </div>

      {/* Puertos Más Atacados */}
      {stats.puertos_mas_atacados && stats.puertos_mas_atacados.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Puertos Más Atacados
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.puertos_mas_atacados.slice(0, 10).map((port, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  port.es_scada_critico
                    ? 'bg-red-50 border-red-300'
                    : 'bg-blue-50 border-blue-300'
                }`}
              >
                <p className="text-2xl font-bold text-gray-900">{port.puerto}</p>
                <p className="text-xs text-gray-600 mt-1">{port.total_intentos} intentos</p>
                {port.es_scada_critico && (
                  <span className="inline-block mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    SCADA
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patrones Detectados */}
      {stats.patrones_detectados && stats.patrones_detectados.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Patrones de Ataque Detectados
          </h2>
          <div className="space-y-3">
            {stats.patrones_detectados.slice(0, 5).map((pattern, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{pattern.tipo_ataque}</p>
                  <p className="text-sm text-gray-600">
                    {pattern.frecuencia} ataques ({pattern.porcentaje.toFixed(1)}%)
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pattern.severidad === 'Crítico'
                        ? 'bg-red-100 text-red-800'
                        : pattern.severidad === 'Alto'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {pattern.severidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
