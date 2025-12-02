/**
 * Página de análisis específico de sistemas SCADA
 */
import { useState, useEffect } from 'react';
import { Activity, Server, AlertOctagon } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PortAnalysisTable from '../components/tables/PortAnalysisTable';
import SCADAAlertCard from '../components/cards/SCADAAlertCard';
import { fetchPortAnalysis, fetchCoordinatedAttacks } from '../services/api';

const SCADAAnalysis = () => {
  const [ports, setPorts] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [portsData, attacksData] = await Promise.all([
        fetchPortAnalysis(20),
        fetchCoordinatedAttacks()
      ]);
      setPorts(portsData);
      setAttacks(attacksData);
    } catch (error) {
      console.error('Error cargando análisis SCADA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Analizando sistemas SCADA..." />;
  }

  const scadaPorts = ports.filter(p => p.es_scada_critico);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="text-blue-600" />
          Análisis de Sistemas SCADA
        </h1>
        <p className="text-gray-600 mt-2">
          Monitoreo especializado de infraestructura crítica de control industrial
        </p>
      </div>

      {/* Alertas críticas SCADA */}
      {scadaPorts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertOctagon className="text-red-600 flex-shrink-0" size={32} />
            <div>
              <h2 className="text-xl font-bold text-red-900 mb-2">
                ⚠️ ALERTA: Puertos SCADA Comprometidos
              </h2>
              <p className="text-red-700 mb-4">
                Se han detectado {scadaPorts.length} puertos críticos de protocolos industriales 
                bajo ataque activo. Estos sistemas controlan infraestructura esencial de la planta eólica.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scadaPorts.slice(0, 3).map((port, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-red-300">
                    <p className="text-xs text-gray-600 mb-1">Puerto {port.puerto}</p>
                    <p className="font-bold text-gray-900">{port.descripcion_servicio}</p>
                    <p className="text-sm text-red-600 font-semibold mt-2">
                      {port.total_intentos} intentos de intrusión
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ataques coordinados */}
      {attacks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertOctagon className="text-orange-600" />
            Ataques Coordinados Detectados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {attacks.map((attack, idx) => (
              <SCADAAlertCard
                key={idx}
                alert={{
                  title: `Ataque Coordinado a ${attack.target_ip}`,
                  description: `${attack.attacking_ips.length} IPs atacando simultáneamente. Tipos: ${attack.attack_types.join(', ')}`,
                  severity: attack.severity,
                  timestamp: attack.timestamp
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabla de análisis de puertos */}
      <PortAnalysisTable data={ports} />

      {/* Información de protocolos SCADA */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Server size={20} />
          Protocolos SCADA Monitoreados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { puerto: 502, nombre: 'Modbus TCP', descripcion: 'Comunicación PLC/RTU' },
            { puerto: 102, nombre: 'S7comm', descripcion: 'Siemens STEP 7' },
            { puerto: 2404, nombre: 'IEC 60870-5-104', descripcion: 'Control de subestaciones' },
            { puerto: 20000, nombre: 'DNP3', descripcion: 'Utilities y energía' },
            { puerto: 44818, nombre: 'Ethernet/IP', descripcion: 'Control industrial' }
          ].map((protocol, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-blue-300">
              <p className="font-mono text-sm text-blue-600 font-bold">Puerto {protocol.puerto}</p>
              <p className="font-semibold text-gray-900 mt-1">{protocol.nombre}</p>
              <p className="text-xs text-gray-600 mt-1">{protocol.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SCADAAnalysis;