import React, { useEffect, useState } from 'react';
import { ShieldAlert, User, Trash2, UserPlus } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { getSession } from '../services/apiService';
import { TechnicianSession, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const UserManagement: React.FC = () => {
  const [session, setSession] = useState<TechnicianSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = getSession();
    setSession(s);
  }, []);

  // Mock Users
  const users = [
    { id: 1, name: 'John Doe', role: UserRole.TECHNICIAN, status: 'Active' },
    { id: 2, name: 'Sarah Smith', role: UserRole.SUPERVISOR, status: 'Active' },
    { id: 3, name: 'Mike Johnson', role: UserRole.TECHNICIAN, status: 'Inactive' },
  ];

  if (!session) return null;

  // Access Control Check
  if (session.role !== UserRole.ADMINISTRATOR) {
    return (
      <Layout title="Access Denied" showBack>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="bg-red-100 p-6 rounded-full mb-4">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">
            You do not have permission to view this page. This area is restricted to Administrators only.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management" showBack>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
           <h3 className="font-bold text-gray-800">System Users</h3>
           <button className="text-wiz-blue text-sm font-semibold flex items-center gap-1">
              <UserPlus size={16} /> Add User
           </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                   <User size={20} className="text-gray-500" />
                </div>
                <div>
                   <p className="font-bold text-gray-900">{user.name}</p>
                   <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{user.role}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                   </div>
                </div>
              </div>
              <button className="text-red-400 hover:text-red-600 p-2">
                 <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">
            <p><strong>Note:</strong> As an Administrator, you can add, remove, or modify technician permissions. All changes are logged.</p>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;