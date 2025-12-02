/**
 * Página de análisis de patrones de ataque
 */
import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchAttackPatterns, fetchTimeline } from '../services/api';
import ThreatTimeline from '../components/charts/ThreatTimeline';

const PatternAnalysis = () => {
  const [patterns, setPatterns] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patternsData, timelineData] = await Promise.all([
        fetchAttackPatterns(),
        fetchTimeline('H')
      ]);
      setPatterns(patternsData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error cargando patrones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Analizando patrones de ataque..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="text-blue-600" />
          Análisis de Patrones de Ataque
        </h1>
        <p className="text-gray-600 mt-2">
          Identificación de comportamientos maliciosos y tendencias de amenazas
        </p>
      </div>

      {/* Timeline */}
      <ThreatTimeline data={timeline} />

      {/* Patrones detectados */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Patrones Identificados</h2>
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{pattern.tipo_ataque}</h3>
                  <p className="text-sm text-gray-600">
                    Horario pico: {pattern.horario_pico}
                  </p>
                </div>
                <span className={`badge-${
                  pattern.severidad === 'Crítico' ? 'danger' :
                  pattern.severidad === 'Alto' ? 'warning' : 'info'
                }`}>
                  {pattern.severidad}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Frecuencia</p>
                  <p className="text-2xl font-bold text-blue-600">{pattern.frecuencia}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Porcentaje del Total</p>
                  <p className="text-2xl font-bold text-purple-600">{pattern.porcentaje}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IPs Involucradas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pattern.ips_involucradas?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">IPs de Origen:</p>
                <div className="flex flex-wrap gap-2">
                  {pattern.ips_involucradas?.slice(0, 8).map((ip, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                      {ip}
                    </span>
                  ))}
                  {pattern.ips_involucradas?.length > 8 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      +{pattern.ips_involucradas.length - 8} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;