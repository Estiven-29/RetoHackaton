/**
 * Página de respuesta automatizada
 */
import { useState, useEffect } from 'react';
import { Zap, Download, Terminal, Shield, Play } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuickActionsCard from '../components/cards/QuickActionsCard';
import {
  fetchFirewallRules,
  fetchFail2BanConfig,
  fetchQuickActions,
  simulateAttack
} from '../services/api';

const AutoResponse = () => {
  const [firewallRules, setFirewallRules] = useState(null);
  const [fail2ban, setFail2ban] = useState(null);
  const [quickActions, setQuickActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('iptables');
  
  // Simulador
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, fail2banData, actionsData] = await Promise.all([
        fetchFirewallRules('Alto'),
        fetchFail2BanConfig(),
        fetchQuickActions()
      ]);
      setFirewallRules(rulesData);
      setFail2ban(fail2banData);
      setQuickActions(actionsData);
    } catch (error) {
      console.error('Error cargando respuesta automática:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRules = () => {
    if (!firewallRules) return;
    
    const rules = firewallRules.rules[selectedPlatform].join('\n');
    const blob = new Blob([rules], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firewall-rules-${selectedPlatform}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFail2Ban = () => {
    if (!fail2ban) return;
    
    const blob = new Blob([fail2ban.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ids-scada.conf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const attackType = formData.get('attackType');
    const target = formData.get('target');
    
    try {
      setSimLoading(true);
      const result = await simulateAttack(attackType, target);
      setSimResult(result);
    } catch (error) {
      console.error('Error simulando ataque:', error);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generando respuestas automáticas..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Zap className="text-yellow-600" />
          Respuesta Automatizada
        </h1>
        <p className="text-gray-600 mt-2">
          Generación automática de reglas, scripts y playbooks de remediación
        </p>
      </div>

      {/* Acciones Rápidas */}
      {quickActions && <QuickActionsCard actions={quickActions.actions} />}

      {/* Reglas de Firewall */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reglas de Firewall</h2>
              <p className="text-sm text-gray-600">
                {firewallRules?.total_rules || 0} reglas generadas para IPs de alto riesgo
              </p>
            </div>
          </div>
          <button
            onClick={downloadRules}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={18} />
            Descargar Reglas
          </button>
        </div>

        {/* Selector de plataforma */}
        <div className="flex gap-2 mb-4">
          {['iptables', 'cisco_asa', 'windows_firewall', 'pfsense'].map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedPlatform === platform
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {platform.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Reglas */}
        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={16} className="text-green-400" />
            <span className="text-sm text-gray-400">
              {selectedPlatform.replace('_', ' ')} Rules
            </span>
          </div>
          <pre className="text-sm text-green-400 font-mono">
            {firewallRules?.rules[selectedPlatform]?.join('\n') || 'No hay reglas disponibles'}
          </pre>
        </div>

        {/* Instrucciones */}
        {firewallRules?.apply_instructions[selectedPlatform] && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Instrucciones de Aplicación:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• <strong>Aplicar:</strong> {firewallRules.apply_instructions[selectedPlatform].apply}</li>
              <li>• <strong>Persistir:</strong> {firewallRules.apply_instructions[selectedPlatform].persist}</li>
              <li>• <strong>Verificar:</strong> {firewallRules.apply_instructions[selectedPlatform].verify}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Configuración Fail2Ban */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-red-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración Fail2Ban</h2>
              <p className="text-sm text-gray-600">
                {fail2ban?.ips_to_ban?.length || 0} IPs a bloquear automáticamente
              </p>
            </div>
          </div>
          <button
            onClick={downloadFail2Ban}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download size={18} />
            Descargar Config
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
            {fail2ban?.content || 'No hay configuración disponible'}
          </pre>
        </div>

        {fail2ban?.instructions && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">📋 Pasos de Instalación:</h4>
            <ol className="space-y-1 text-sm text-red-800 list-decimal list-inside">
              {fail2ban.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Simulador de Ataques */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Play className="text-purple-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Simulador de Escenarios</h2>
              <p className="text-sm text-gray-600">
                Simula ataques para calcular impacto y tiempo de recuperación
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {simulatorOpen ? 'Ocultar' : 'Abrir Simulador'}
          </button>
        </div>

        {simulatorOpen && (
          <div className="mt-4">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Ataque
                  </label>
                  <select
                    name="attackType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="SQL Injection">SQL Injection</option>
                    <option value="Port scan">Port Scan</option>
                    <option value="Brute force SSH">Brute Force SSH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sistema Objetivo
                  </label>
                  <input
                    type="text"
                    name="target"
                    placeholder="ej: Servidor SCADA Principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={simLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {simLoading ? 'Simulando...' : '🎮 Ejecutar Simulación'}
              </button>
            </form>

            {simResult && (
              <div className="mt-6 p-6 bg-white rounded-lg border-2 border-purple-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  📊 Resultados de la Simulación: {simResult.name}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Downtime Estimado</p>
                    <p className="text-lg font-bold text-red-600">{simResult.estimated_downtime}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Impacto al Negocio</p>
                    <p className="text-sm font-bold text-orange-600">{simResult.business_impact}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tiempo Recuperación</p>
                    <p className="text-lg font-bold text-blue-600">{simResult.recovery_time}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Sistemas Afectados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {simResult.target_systems?.map((system, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Impacto Potencial:</h4>
                    <ul className="space-y-1">
                      {simResult.potential_impact?.map((impact, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🔒 Datos en Riesgo:</h4>
                    <p className="text-sm text-gray-700">{simResult.data_at_risk}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Pasos de Mitigación:</h4>
                    <ol className="space-y-1 list-decimal list-inside">
                      {simResult.mitigation_steps?.map((step, idx) => (
                        <li key={idx} className="text-sm text-green-800">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoResponse;
