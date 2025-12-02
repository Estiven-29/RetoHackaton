/**
 * Página de gestión de datasets
 */
import { useState, useEffect } from 'react';
import { Database, Trash2, BarChart3, Calendar, Hash } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UploadCard from '../components/cards/UploadCard';
import { listDatasets, deleteDataset, analyzeDataset } from '../services/api';

const DatasetManager = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await listDatasets();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Error cargando datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (datasetId) => {
    if (!confirm('¿Estás seguro de eliminar este dataset?')) return;

    try {
      await deleteDataset(datasetId);
      await loadDatasets();
    } catch (error) {
      console.error('Error eliminando dataset:', error);
      alert('Error al eliminar el dataset');
    }
  };

  const handleAnalyze = async (datasetId) => {
    try {
      setAnalyzing(datasetId);
      const result = await analyzeDataset(datasetId);
      alert(`Análisis completado:\n${result.total_logs} logs analizados\n${result.ips_sospechosas.length} IPs sospechosas`);
    } catch (error) {
      console.error('Error analizando dataset:', error);
      alert('Error al analizar el dataset');
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datasets..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="text-blue-600" />
          Gestión de Datasets
        </h1>
        <p className="text-gray-600 mt-2">
          Sube y gestiona múltiples datasets para análisis comparativo
        </p>
      </div>

      {/* Upload Card */}
      <UploadCard onUploadSuccess={loadDatasets} />

      {/* Datasets List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Datasets Disponibles ({datasets.length})
        </h2>

        {datasets.length === 0 ? (
          <div className="text-center py-12">
            <Database className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No hay datasets cargados</p>
            <p className="text-sm text-gray-500 mt-2">Sube tu primer dataset arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{dataset.original_name}</h3>
                    {dataset.description && (
                      <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    {dataset.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash size={16} className="text-gray-400" />
                    <span className="text-gray-600">{dataset.records.toLocaleString()} registros</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(dataset.uploaded_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Período de datos:</p>
                  <p className="text-xs font-mono text-gray-700">
                    {new Date(dataset.date_range.start).toLocaleDateString('es-ES')} - 
                    {new Date(dataset.date_range.end).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Tipos de ataque:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(dataset.attack_types).slice(0, 3).map(([type, count]) => (
                      <span key={type} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {type}: {count}
                      </span>
                    ))}
                    {Object.keys(dataset.attack_types).length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{Object.keys(dataset.attack_types).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze(dataset.id)}
                    disabled={analyzing === dataset.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    <BarChart3 size={16} />
                    {analyzing === dataset.id ? 'Analizando...' : 'Analizar'}
                  </button>
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetManager;
