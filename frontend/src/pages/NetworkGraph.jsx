/**
 * Página de visualización de grafo de red
 */
import { useState, useEffect } from 'react';
import { Network, MapPin, GitBranch } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchAttackNetworkGraph, fetchAttackPaths, fetchAttackHotspots } from '../services/api';

const NetworkGraph = () => {
  const [graphData, setGraphData] = useState(null);
  const [paths, setPaths] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

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
      {graphData && (
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

      {/* Visualización Simple del Grafo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Visualización de Red</h2>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-blue-200 min-h-[400px]">
          <div className="text-center">
            <Network size={64} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Grafo de Red Generado
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Para visualización interactiva, integrar con D3.js, Cytoscape o vis.js
            </p>
            
            {/* Representación textual simplificada */}
            <div className="text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-2">Nodos Principales:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {graphData?.nodes?.slice(0, 10).map((node, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      node.type === 'attacker' ? 'bg-red-100 hover:bg-red-200' :
                      node.type === 'target' ? 'bg-blue-100 hover:bg-blue-200' :
                      'bg-purple-100 hover:bg-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{node.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 bg-white rounded">
                          {node.type === 'attacker' ? '🔴 Atacante' :
                           node.type === 'target' ? '🔵 Objetivo' : '🟣 Ambos'}
                        </span>
                        <span className="text-xs">
                          {node.attacks_sent > 0 && `↗️ ${node.attacks_sent}`}
                          {node.attacks_received > 0 && ` ↘️ ${node.attacks_received}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Nodo Seleccionado: {selectedNode.label}</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Tipo:</span> {selectedNode.type}
              </div>
              <div>
                <span className="text-blue-700">Ataques Enviados:</span> {selectedNode.attacks_sent}
              </div>
              <div>
                <span className="text-blue-700">Ataques Recibidos:</span> {selectedNode.attacks_received}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
          <p className="text-sm text-yellow-800">
            💡 <strong>Integración sugerida:</strong> Usar D3.js Force-Directed Graph o Cytoscape.js para visualización interactiva avanzada.
            Los datos están disponibles en formato compatible con estas librerías.
          </p>
        </div>
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
              <div key={idx} className="border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-semibold text-lg">{path.attacker}</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {path.total_steps} pasos • Duración: {path.duration}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {path.targets.length} objetivos
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Secuencia de Ataques:</h4>
                  {path.sequence.slice(0, 5).map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">{stepIdx + 1}.</span>
                      <span className="font-mono text-xs">{new Date(step.time).toLocaleTimeString()}</span>
                      <span>→</span>
                      <span className="font-mono">{step.target}:{step.port}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                        {step.attack}
                      </span>
                    </div>
                  ))}
                  {path.sequence.length > 5 && (
                    <p className="text-xs text-gray-500 pl-6">
                      ... y {path.sequence.length - 5} pasos más
                    </p>
                  )}
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
                className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-lg font-bold">{hotspot.ip}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    hotspot.severity === 'Crítico' ? 'bg-red-600 text-white' :
                    hotspot.severity === 'Alto' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {hotspot.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total Ataques:</span>
                    <span className="ml-2 font-bold text-red-600">{hotspot.total_attacks}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Atacantes Únicos:</span>
                    <span className="ml-2 font-bold text-orange-600">{hotspot.unique_attackers}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Puertos Objetivo:</p>
                  <div className="flex flex-wrap gap-1">
                    {hotspot.ports_targeted.slice(0, 8).map((port, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs font-mono">
                        {port}
                      </span>
                    ))}
                    {hotspot.ports_targeted.length > 8 && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
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
