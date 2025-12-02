/**
 * Página de visualización de grafo de red
 */
import { useState, useEffect } from 'react';
import { Network, MapPin, GitBranch, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchAttackNetworkGraph, fetchAttackPaths, fetchAttackHotspots } from '../services/api';
import { useDataset } from '../context/DatasetContext';

const NetworkGraph = () => {
  const { activeDatasetId } = useDataset();
  const [graphData, setGraphData] = useState(null);
  const [paths, setPaths] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeDatasetId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [graph, pathsData, hotspotsData] = await Promise.all([
        fetchAttackNetworkGraph(),
        fetchAttackPaths(),
        fetchAttackHotspots()
      ]);
      setGraphData(graph);
      setPaths(pathsData);
      setHotspots(hotspotsData);
    } catch (error) {
      console.error('Error cargando grafo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generando grafo de red..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Network className="text-blue-600" />
          Grafo de Red de Ataques
        </h1>
        <p className="text-gray-600 mt-2">
          Visualización de relaciones entre atacantes y objetivos
        </p>
      </div>

      {/* Estadísticas del Grafo */}
      {graphData && graphData.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total Nodos</p>
            <p className="text-3xl font-bold text-blue-600">{graphData.stats.total_nodes}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Conexiones</p>
            <p className="text-3xl font-bold text-purple-600">{graphData.stats.total_edges}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Atacantes</p>
            <p className="text-3xl font-bold text-red-600">{graphData.stats.attackers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Objetivos</p>
            <p className="text-3xl font-bold text-green-600">{graphData.stats.targets}</p>
          </div>
        </div>
      )}

      {/* Visualización de Nodos Principales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Visualización de Red</h2>
        
        {graphData && graphData.nodes && graphData.nodes.length > 0 ? (
          <div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Nodos Principales:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {graphData.nodes.slice(0, 20).map((node, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode(selectedNode?.label === node.label ? null : node)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedNode?.label === node.label 
                        ? 'border-blue-500 bg-blue-50' 
                        : node.type === 'attacker' 
                          ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                          : node.type === 'target' 
                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
                            : 'bg-purple-50 hover:bg-purple-100 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          node.type === 'attacker' ? 'bg-red-600' :
                          node.type === 'target' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}></div>
                        <span className="font-mono font-semibold text-gray-900">{node.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          node.type === 'attacker' ? 'bg-red-100 text-red-800' :
                          node.type === 'target' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {node.type === 'attacker' ? '🔴 Atacante' :
                           node.type === 'target' ? '🔵 Objetivo' : '🟣 Ambos'}
                        </span>
                        <div className="text-sm flex gap-3">
                          {node.attacks_sent > 0 && (
                            <span className="text-red-600 font-semibold">
                              ↗️ {node.attacks_sent}
                            </span>
                          )}
                          {node.attacks_received > 0 && (
                            <span className="text-blue-600 font-semibold">
                              ↘️ {node.attacks_received}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedNode && (
              <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Network size={20} />
                  Detalles del Nodo: {selectedNode.label}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-blue-700 font-semibold">Tipo:</span>
                    <p className="text-gray-900 font-semibold mt-1">{selectedNode.type}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-blue-700 font-semibold">Ataques Enviados:</span>
                    <p className="text-red-600 font-bold text-xl mt-1">{selectedNode.attacks_sent}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-blue-700 font-semibold">Ataques Recibidos:</span>
                    <p className="text-blue-600 font-bold text-xl mt-1">{selectedNode.attacks_received}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm text-yellow-900 font-semibold mb-1">
                    💡 Integración Avanzada Disponible
                  </p>
                  <p className="text-xs text-yellow-800">
                    Para visualización interactiva 3D, integrar con <strong>D3.js Force-Directed Graph</strong>, 
                    <strong> Cytoscape.js</strong> o <strong>vis.js</strong>. 
                    Los datos están disponibles en formato compatible con estas librerías.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Network className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No hay datos suficientes para generar el grafo</p>
          </div>
        )}
      </div>

      {/* Rutas de Ataque */}
      {paths && paths.paths && paths.paths.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GitBranch className="text-purple-600" />
            Rutas de Ataque Identificadas ({paths.total_paths})
          </h2>

          <div className="space-y-4">
            {paths.paths.slice(0, 5).map((path, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-lg text-purple-900">{path.attacker}</span>
                    <p className="text-sm text-purple-700 mt-1">
                      {path.total_steps} pasos • Duración: {path.duration}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">
                    {path.targets.length} objetivos
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-purple-900">Secuencia de Ataques:</h4>
                  <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                    {path.sequence.slice(0, 5).map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-2 text-sm py-2 border-b last:border-b-0">
                        <span className="text-gray-500 font-semibold">{stepIdx + 1}.</span>
                        <span className="font-mono text-xs text-gray-600">
                          {new Date(step.time).toLocaleTimeString('es-ES')}
                        </span>
                        <span className="text-purple-600">→</span>
                        <span className="font-mono text-sm font-semibold">{step.target}:{step.port}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-semibold ml-auto">
                          {step.attack}
                        </span>
                      </div>
                    ))}
                    {path.sequence.length > 5 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        ... y {path.sequence.length - 5} pasos más
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotspots */}
      {hotspots && hotspots.hotspots && hotspots.hotspots.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="text-red-600" />
            Hotspots - IPs Más Atacadas ({hotspots.total_hotspots})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotspots.hotspots.map((hotspot, idx) => (
              <div
                key={idx}
                className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xl font-bold text-red-900">{hotspot.ip}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    hotspot.severity === 'Crítico' ? 'bg-red-600 text-white' :
                    hotspot.severity === 'Alto' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {hotspot.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-xs text-gray-600">Total Ataques:</span>
                    <p className="text-2xl font-bold text-red-600">{hotspot.total_attacks}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-xs text-gray-600">Atacantes Únicos:</span>
                    <p className="text-2xl font-bold text-orange-600">{hotspot.unique_attackers}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-red-700 font-semibold mb-2">Puertos Objetivo:</p>
                  <div className="flex flex-wrap gap-1">
                    {hotspot.ports_targeted.slice(0, 8).map((port, pIdx) => (
                      <span key={pIdx} className="px-2 py-1 bg-white text-red-700 rounded text-xs font-mono font-semibold">
                        {port}
                      </span>
                    ))}
                    {hotspot.ports_targeted.length > 8 && (
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">
                        +{hotspot.ports_targeted.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
