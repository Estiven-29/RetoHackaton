/**
 * Card de acciones rápidas automatizadas
 */
import { Zap, Terminal, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const QuickActionsCard = ({ actions }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const getPriorityColor = (priority) => {
    const colors = {
      'CRÍTICA': 'bg-red-50 border-red-500 text-red-900',
      'ALTA': 'bg-orange-50 border-orange-500 text-orange-900',
      'MEDIA': 'bg-yellow-50 border-yellow-500 text-yellow-900'
    };
    return colors[priority] || 'bg-gray-50 border-gray-500 text-gray-900';
  };

  const copyCommand = (command, index) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-600 p-3 rounded-lg">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Acciones Rápidas</h3>
          <p className="text-sm text-gray-600">Respuesta automatizada inmediata</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-lg p-4 ${getPriorityColor(action.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-bold rounded">
                    {action.priority}
                  </span>
                  <span className="text-xs text-gray-600">
                    ⏱️ {action.estimated_time}
                  </span>
                </div>
                <p className="font-semibold text-sm">{action.action}</p>
              </div>
            </div>

            {action.affected_ips && (
              <div className="mb-2">
                <p className="text-xs text-gray-700 mb-1">IPs afectadas:</p>
                <div className="flex flex-wrap gap-1">
                  {action.affected_ips.map((ip, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white/50 rounded text-xs font-mono"
                    >
                      {ip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {action.command && (
              <div className="mt-3 bg-gray-900 rounded-lg p-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-green-400" />
                    <span className="text-xs text-gray-400">Comando</span>
                  </div>
                  <button
                    onClick={() => copyCommand(action.command, index)}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                  >
                    {copiedIndex === index ? (
                      <>
                        <CheckCircle size={14} />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <code className="text-xs text-green-400 font-mono block overflow-x-auto">
                  {action.command}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
