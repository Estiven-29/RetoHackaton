import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

const Layout = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [systemStatus, setSystemStatus] = useState('online');

  const handleRefresh = async () => {
    setRefreshTrigger(prev => prev + 1);
    // Simular cambio de estado
    setSystemStatus('loading');
    setTimeout(() => setSystemStatus('online'), 2000);
  };

  useEffect(() => {
    // Simular monitoreo de estado del sistema
    const interval = setInterval(() => {
      const statuses = ['online', 'warning', 'online'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSystemStatus(randomStatus);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onRefresh={handleRefresh} status={systemStatus} />

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="animate-fade-in">
              <Outlet context={{ refreshTrigger }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;