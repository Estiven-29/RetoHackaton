import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  FileText,
  TrendingUp,
  Server,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: 'Dashboard Principal',
      description: 'Vista general del sistema',
      badge: null
    },
    {
      path: '/pattern-analysis',
      icon: TrendingUp,
      label: 'Análisis de Patrones',
      description: 'Patrones y tendencias',
      badge: '3'
    },
    {
      path: '/scada-analysis',
      icon: Server,
      label: 'Análisis SCADA',
      description: 'Sistemas críticos',
      badge: '5',
      critical: true
    },
    {
      path: '/recommendations',
      icon: ShieldAlert,
      label: 'Recomendaciones',
      description: 'Medidas de seguridad',
      badge: '2'
    },
  ];

  return (
    <aside className="bg-white w-80 border-r border-gray-200 min-h-screen flex flex-col shadow-lg">
      {/* Logo area */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">SCADA IDS</h2>
            <p className="text-xs text-gray-500">Sistema de Detección</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover-lift ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`
                }
              >
                {/* Icono */}
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  <Icon size={20} />
                </div>
                
                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-semibold text-sm transition-colors ${
                      isActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'
                    }`}>
                      {item.label}
                    </p>
                    {item.badge && (
                      <span className={`flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                        item.critical 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 group-hover:bg-blue-500 group-hover:text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {/* Indicador activo */}
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema Operativo</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">v1.0.0 • SCADA IDS</p>
          <p className="text-xs text-gray-400">
            © 2025 Ciberseguridad Industrial
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;