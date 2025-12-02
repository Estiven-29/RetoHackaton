import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  subtitle,
  loading = false 
}) => {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
      trend: 'text-blue-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600',
      trend: 'text-red-600'
    },
    green: {
      bg: 'bg-green-50', 
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
      trend: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-600',
      trend: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
      trend: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600',
      trend: 'text-orange-600'
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp size={16} className="text-red-600" />;
    if (trend < 0) return <TrendingDown size={16} className="text-green-600" />;
    return <Minus size={16} className="text-gray-600" />;
  };

  const getTrendText = () => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="metric-card">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-8 w-16 rounded"></div>
            <div className="skeleton h-3 w-32 rounded"></div>
          </div>
          <div className="skeleton w-12 h-12 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card group hover-lift">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {subtitle && (
            <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
          )}
          
          {trend !== undefined && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-semibold ${getTrendText()}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-gray-500">vs. periodo anterior</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${config.icon}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {/* Efecto de gradiente en hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none"></div>
    </div>
  );
};

export default MetricCard;