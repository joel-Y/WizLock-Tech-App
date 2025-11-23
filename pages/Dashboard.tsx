import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Activity, 
  LogOut, 
  Database,
  RefreshCw,
  Search,
  Router,
  Users
} from 'lucide-react';
import Layout from '../components/Layout';
import { getSession, logout, getPendingLogsCount, syncLogs } from '../services/apiService';
import { TechnicianSession, UserRole } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<TechnicianSession | null>(null);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate('/');
      return;
    }
    setSession(s);
    setPendingSyncs(getPendingLogsCount());
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSync = async () => {
      setIsSyncing(true);
      await syncLogs();
      setPendingSyncs(0);
      setIsSyncing(false);
  }

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRATOR: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.SUPERVISOR: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const allActions = [
    {
      title: 'Provision Lock',
      subtitle: 'Add a new TTLock device',
      icon: <Plus className="w-6 h-6 text-white" />,
      color: 'bg-wiz-blue',
      path: '/provision/lock',
      roles: [UserRole.ADMINISTRATOR, UserRole.SUPERVISOR, UserRole.TECHNICIAN]
    },
    {
      title: 'Provision Gateway',
      subtitle: 'Setup WiFi bridge',
      icon: <Router className="w-6 h-6 text-white" />,
      color: 'bg-wiz-orange',
      path: '/provision/gateway',
      roles: [UserRole.ADMINISTRATOR, UserRole.SUPERVISOR, UserRole.TECHNICIAN]
    },
    {
      title: 'Diagnostics',
      subtitle: 'Check device health',
      icon: <Activity className="w-6 h-6 text-white" />,
      color: 'bg-purple-600',
      path: '/diagnostics',
      roles: [UserRole.ADMINISTRATOR, UserRole.SUPERVISOR, UserRole.TECHNICIAN]
    },
    {
      title: 'Find Device',
      subtitle: 'Scan nearby devices',
      icon: <Search className="w-6 h-6 text-white" />,
      color: 'bg-emerald-600',
      path: '/scan',
      roles: [UserRole.ADMINISTRATOR, UserRole.SUPERVISOR, UserRole.TECHNICIAN]
    },
    {
      title: 'User Management',
      subtitle: 'Manage technician access',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-gray-800',
      path: '/admin/users',
      roles: [UserRole.ADMINISTRATOR]
    }
  ];

  const visibleActions = allActions.filter(action => 
    session && action.roles.includes(session.role)
  );

  return (
    <Layout 
      title="Dashboard" 
      actions={
        <button onClick={handleLogout} className="p-2 text-white/80 hover:text-white">
          <LogOut size={20} />
        </button>
      }
    >
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Hello, {session?.username}</h2>
              <p className="text-sm text-gray-500">Ready to install some hardware?</p>
            </div>
            {session?.role && (
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getRoleBadgeColor(session.role)}`}>
                {session.role}
              </span>
            )}
          </div>
          
          {pendingSyncs > 0 && (
             <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center justify-between">
                 <div className="flex items-center gap-2 text-amber-700 text-sm">
                     <Database size={16} />
                     <span>{pendingSyncs} pending records</span>
                 </div>
                 <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-amber-700 hover:bg-amber-100 p-1.5 rounded-full transition-colors"
                 >
                     <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                 </button>
             </div>
          )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          {visibleActions.map((action) => (
            <button
              key={action.title}
              onClick={() => action.path !== '#' && navigate(action.path)}
              className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start text-left hover:shadow-md transition-shadow group ${action.path === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`${action.color} p-3 rounded-xl mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-bold text-gray-900 leading-tight">{action.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{action.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 px-1">Recent Activity</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            <div className="p-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Bound Lock #4829</p>
                <p className="text-xs text-gray-500">Skyline Heights • Rm 102</p>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
             <div className="p-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Diagnostics Run</p>
                <p className="text-xs text-gray-500">Riverside Commons • Rm 304</p>
              </div>
              <span className="text-xs text-gray-400">5h ago</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;