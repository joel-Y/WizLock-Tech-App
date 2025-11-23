import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Lock, User, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import { loginTechnician } from '../services/apiService';
import { APP_VERSION } from '../constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const performLogin = async (u: string, p: string) => {
    setIsLoading(true);
    setError('');

    try {
      await loginTechnician(u, p);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleUser: string) => {
    setUsername(roleUser);
    setPassword('password');
    performLogin(roleUser, 'password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="bg-wiz-blue w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 transform -rotate-3">
             <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">WizSmith</h1>
          <p className="text-gray-500 font-medium">Technician Portal</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Technician ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wiz-blue focus:border-wiz-blue transition-all outline-none"
                  placeholder="Enter ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wiz-blue focus:border-wiz-blue transition-all outline-none"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth isLoading={isLoading} className="mt-4">
              Sign In
            </Button>
          </form>
        </div>

        {/* Quick Login Section for Testing */}
        <div className="mt-8 space-y-3">
          <p className="text-center text-xs text-gray-400 uppercase tracking-wider font-semibold">Test Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-wiz-blue hover:bg-blue-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 font-bold text-xs">AD</div>
              <span className="text-xs font-medium text-gray-600">Admin</span>
            </button>
            
            <button 
              onClick={() => handleQuickLogin('supervisor')}
              className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-wiz-blue hover:bg-blue-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 font-bold text-xs">SV</div>
              <span className="text-xs font-medium text-gray-600">Super</span>
            </button>

            <button 
              onClick={() => handleQuickLogin('tech')}
              className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-wiz-blue hover:bg-blue-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-2 font-bold text-xs">TC</div>
              <span className="text-xs font-medium text-gray-600">Tech</span>
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-xs mt-6">
          v{APP_VERSION} • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;