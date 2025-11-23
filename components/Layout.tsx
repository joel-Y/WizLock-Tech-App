import React from 'react';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false, actions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isHome = location.pathname === '/dashboard';
  const isLogin = location.pathname === '/';

  if (isLogin) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        {/* Header */}
        <header className="bg-wiz-blue text-white p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && (
                <button 
                  onClick={() => navigate(-1)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <h1 className="text-xl font-bold tracking-tight">{title || 'WizSmith'}</h1>
            </div>
            <div className="flex items-center gap-2">
               {isOnline ? (
                   <div className="flex items-center text-xs bg-green-500/20 px-2 py-1 rounded border border-green-400/30">
                       <Wifi size={14} className="mr-1" /> Online
                   </div>
               ) : (
                   <div className="flex items-center text-xs bg-red-500/20 px-2 py-1 rounded border border-red-400/30">
                       <WifiOff size={14} className="mr-1" /> Offline
                   </div>
               )}
               {actions}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-6">
          {children}
        </main>
        
        {/* Offline Banner if needed */}
        {!isOnline && (
            <div className="bg-gray-800 text-gray-300 text-xs text-center py-1">
                You are working offline. Changes will sync when connectivity is restored.
            </div>
        )}
      </div>
    </div>
  );
};

export default Layout;