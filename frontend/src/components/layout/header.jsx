import { Shield, Bell, RefreshCw, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = ({ onRefresh, status = 'online' }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-100';
      case 'warning': return 'text-yellow-500 bg-yellow-100';
      case 'error': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-glass">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-glow">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IDS SCADA Dashboard
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Activity size={14} className={status === 'online' ? 'text-green-500' : 'text-red-500'} />
                    Planta Eólica La Guajira
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    Monitoreo en Tiempo Real
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            {/* Estado del sistema */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium capitalize">{status}</span>
            </div>

            {/* Última actualización */}
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-700 font-mono">
                {lastUpdate.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* Botón de refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw 
                size={18} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
              <div className="absolute invisible group-hover:visible -bottom-12 right-0 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                5 alertas nuevas
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;