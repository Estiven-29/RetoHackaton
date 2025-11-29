/**
 * Tarjeta de estadística
 */
const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className="text-xs text-gray-500 mt-2">
              Tendencia: <span className="font-semibold">{trend}</span>
            </p>
          )}
        </div>
        <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
          {Icon && <Icon size={32} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
