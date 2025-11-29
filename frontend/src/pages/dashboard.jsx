import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Database,
  Server,
  Eye
} from 'lucide-react';

import LoadingSpinner from '../components/common/LoadingSpinner';
import MetricCard from '../components/cards/MetricCard';
import SuspiciousIPsTable from '../components/tables/SuspiciousIPsTable';
import ThreatTimeline from '../components/charts/ThreatTimeline';
import AttackDistribution from '../components/charts/AttackDistribution';
import PortHeatmap from '../components/charts/PortHeatmap';
import IPsSospechosasChart from '../components/charts/IPsSospechosasChart';

import { fetchDashboardStats } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshTrigger } = useOutletContext();

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simular delay para mostrar loading states
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await fetchDashboardStats();
      setData(result);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-64 rounded mb-2"></div>
            <div className="skeleton h-4 w-96 rounded"></div>
          </div>
          <div className="skeleton h-6 w-48 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MetricCard key={i} loading />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatTimeline loading />
          <AttackDistribution loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos del sistema. Verifica la conexión al servidor.
          </p>
          <button onClick={loadData} className="btn-primary">
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Dashboard IDS - Planta Eólica
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Eye size={16} />
            Monitoreo en tiempo real de sistemas SCADA y control industrial
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Período analizado</p>
          <p className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            {data?.periodo_analizado?.inicio && (
              <>
                {new Date(data.periodo_analizado.inicio).toLocaleDateString('es-ES')} - 
                {new Date(data.periodo_analizado.fin).toLocaleDateString('es-ES')}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Logs Analizados"
          value={data?.total_logs?.toLocaleString('es-ES') || '0'}
          icon={Database}
          color="blue"
          subtitle="Registros procesados"
          trend={12}
        />
        <MetricCard
          title="IPs Sospechosas Detectadas"
          value={data?.ips_sospechosas?.length || '0'}
          icon={AlertTriangle}
          color="red"
          subtitle="Requieren acción inmediata"
          trend={8}
        />
        <MetricCard
          title="Alertas Activas"
          value={data?.alert_summary?.alertas_activas || '0'}
          icon={Activity}
          color="orange"
          subtitle={`${data?.alert_summary?.alertas_criticas || 0} críticas`}
          trend={15}
        />
        <MetricCard
          title="Puertos SCADA Atacados"
          value={data?.puertos_mas_atacados?.filter(p => p.es_scada_critico).length || '0'}
          icon={Server}
          color="purple"
          subtitle="Sistemas críticos"
          trend={5}
        />
      </div>

      {/* Alerta crítica si hay ataques SCADA */}
      {data?.alert_summary?.alertas_criticas > 0 && (
        <div className="alert-critical animate-pulse">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-lg">
                ⚠️ ALERTA CRÍTICA: Ataques a Infraestructura SCADA Detectados
              </h4>
              <p className="text-red-700 mt-1">
                Se han identificado {data.alert_summary.alertas_criticas} intentos de intrusión 
                contra sistemas críticos de control industrial. Revisión inmediata requerida.
              </p>
            </div>
            <button className="btn-danger whitespace-nowrap">
              Ver Detalles
            </button>
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatTimeline data={data?.ataques_por_hora ? 
          Object.entries(data.ataques_por_hora).map(([timestamp, count]) => ({
            timestamp,
            count,
            ataques_detallados: {}
          })) : []
        } />
        <AttackDistribution data={data?.distribucion_ataques} />
      </div>

      {/* Análisis de puertos e IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortHeatmap data={data?.puertos_mas_atacados} />
        <IPsSospechosasChart data={data?.ips_sospechosas} />
      </div>

      {/* Tabla de IPs sospechosas */}
      <SuspiciousIPsTable data={data?.ips_sospechosas} limit={10} />
    </div>
  );
};

export default Dashboard;