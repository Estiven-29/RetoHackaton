/**
 * Página de recomendaciones profesionales basadas en frameworks
 */
import { useState, useEffect } from 'react';
import { GraduationCap, Download, Shield, Filter } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfessionalRecommendationCard from '../components/cards/ProfessionalRecommendationCard';
import { fetchProfessionalRecommendations } from '../services/api';

const ProfessionalRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchProfessionalRecommendations();
      setData(result);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!data) return;
    
    const reportContent = {
      generated_at: new Date().toISOString(),
      frameworks: data.frameworks_applied,
      total_recommendations: data.total_recommendations,
      scada_specific: data.scada_specific,
      recommendations: data.recommendations
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `professional-recommendations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Generando recomendaciones profesionales..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Error al cargar recomendaciones</p>
      </div>
    );
  }

  // Filtrar recomendaciones
  const filteredRecommendations = data.recommendations.filter(rec => {
    const matchesFramework = filterFramework === 'all' || rec.categoria.includes(filterFramework);
    const matchesPriority = filterPriority === 'all' || rec.prioridad === filterPriority;
    return matchesFramework && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="text-blue-600" />
            Recomendaciones Profesionales
          </h1>
          <p className="text-gray-600 mt-2">
            Basadas en frameworks internacionales de ciberseguridad industrial
          </p>
        </div>
        <button onClick={exportReport} className="btn-primary flex items-center gap-2">
          <Download size={18} />
          Exportar Reporte
        </button>
      </div>

      {/* Frameworks Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="text-blue-600" />
          Frameworks Aplicados
        </h2>
        <div className="flex flex-wrap gap-3">
          {data.frameworks_applied?.map((framework, idx) => (
            <div
              key={idx}
              className="px-4 py-2 bg-white rounded-lg border-2 border-blue-300 shadow-sm"
            >
              <p className="font-semibold text-blue-900 text-sm">{framework}</p>
            </div>
          ))}
        </div>
        {data.scada_specific && (
          <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
            <p className="text-sm text-orange-900 font-semibold">
              ⚠️ Recomendaciones específicas para infraestructura SCADA incluidas
            </p>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-600" />
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Framework
              </label>
              <select
                value={filterFramework}
                onChange={(e) => setFilterFramework(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="NIST">NIST CSF</option>
                <option value="ISO">ISO 27001</option>
                <option value="IEC">IEC 62443</option>
                <option value="CIS">CIS Controls</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="Crítico">🔴 Crítico</option>
                <option value="Alto">🟠 Alto</option>
                <option value="Medio">🟡 Medio</option>
                <option value="Bajo">🟢 Bajo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-600">{data.total_recommendations}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Críticas</p>
          <p className="text-3xl font-bold text-red-600">
            {data.recommendations.filter(r => r.prioridad === 'Crítico').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Altas</p>
          <p className="text-3xl font-bold text-orange-600">
            {data.recommendations.filter(r => r.prioridad === 'Alto').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Filtradas</p>
          <p className="text-3xl font-bold text-purple-600">{filteredRecommendations.length}</p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No hay recomendaciones con los filtros seleccionados</p>
          </div>
        ) : (
          filteredRecommendations.map((rec, index) => (
            <ProfessionalRecommendationCard key={index} recommendation={rec} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessionalRecommendations;
