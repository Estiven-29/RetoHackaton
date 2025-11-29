/**
 * Sidebar de navegación
 */
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  TrendingUp,
  Brain,
  Zap,
  Network,
  Database,  // ← NUEVO
  GraduationCap  // ← NUEVO
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: 'Dashboard Principal',
      description: 'Vista general'
    },
    {
      path: '/datasets',  // ← NUEVO
      icon: Database,
      label: 'Gestión Datasets',
      description: 'Upload y comparación',
      badge: 'NEW'
    },
    {
      path: '/pattern-analysis',
      icon: TrendingUp,
      label: 'Análisis de Patrones',
      description: 'Patrones de ataque'
    },
    {
      path: '/scada-analysis',
      icon: Activity,
      label: 'Análisis SCADA',
      description: 'Sistemas críticos'
    },
    {
      path: '/ml-analysis',
      icon: Brain,
      label: 'ML & Predicción',
      description: 'Anomalías y predicción',
      badge: 'AI'
    },
    {
      path: '/auto-response',
      icon: Zap,
      label: 'Respuesta Auto',
      description: 'Remediación automática',
      badge: 'HOT'
    },
    {
      path: '/network-graph',
      icon: Network,
      label: 'Grafo de Red',
      description: 'Visualización de ataques'
    },
    {
      path: '/recommendations',  // ← ACTUALIZADO
      icon: GraduationCap,
      label: 'Recomendaciones Pro',
      description: 'NIST, ISO, IEC 62443',
      badge: 'PRO'
    },
  ];

  return (
    <aside className="bg-white w-64 border-r border-gray-200 min-h-screen relative">
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description}
                  </p>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                    item.badge === 'HOT' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                    item.badge === 'PRO' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Professional Edition
          </p>
          <p className="text-xs text-gray-600">v2.0.0 • 2025</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-600">NIST • ISO • IEC</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
