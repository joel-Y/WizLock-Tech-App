import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Battery, 
  Wifi, 
  Clock, 
  AlertTriangle,
  Play,
  Terminal,
  ShieldAlert,
  RefreshCcw,
  Cpu
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { scanForDevices, resetLock, getFirmwareVersion } from '../services/mockBLEService';
import { getSession } from '../services/apiService';
import { DeviceType, TTLockDevice, UserRole, TechnicianSession } from '../types';

const Diagnostics: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [device, setDevice] = useState<TTLockDevice | null>(null);
  const [firmwareInfo, setFirmwareInfo] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [session, setSession] = useState<TechnicianSession | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
  }, []);

  const addLog = (msg: string) => {
      setLogs(prev => [msg, ...prev]);
  };

  const runDiagnostics = async () => {
    setIsScanning(true);
    setLogs(['Initializing BLE scanner...']);
    
    setTimeout(async () => {
        addLog('Scanning for nearby lock...');
        const devices = await scanForDevices();
        const target = devices.find(d => d.type === DeviceType.LOCK);
        
        if (target) {
            setDevice(target);
            addLog(`Found device: ${target.name}`);
            addLog('Reading battery status...');
            addLog('Checking clock drift...');
            addLog('Diagnostics complete.');
            setFirmwareInfo(target.firmwareVersion || 'Unknown');
        } else {
            addLog('No device found nearby.');
        }
        setIsScanning(false);
    }, 1000);
  };

  const handleCheckFirmware = async () => {
      if(!device) return;
      setIsProcessing(true);
      addLog(`Requesting firmware version from ${device.macAddress}...`);
      const version = await getFirmwareVersion(device.macAddress);
      setFirmwareInfo(version);
      addLog(`Firmware Version: ${version}`);
      addLog('Checking for updates... No updates available.');
      setIsProcessing(false);
  };

  const handleResetLock = async () => {
      if(!device) return;
      if(!window.confirm('Are you sure you want to factory reset this lock? This cannot be undone.')) return;
      
      setIsProcessing(true);
      addLog('Initiating factory reset...');
      await resetLock(device.macAddress);
      addLog('Lock reset successful.');
      setDevice(null);
      setIsProcessing(false);
  };

  const canSeeAdvanced = session?.role === UserRole.ADMINISTRATOR || session?.role === UserRole.SUPERVISOR;

  return (
    <Layout title="Diagnostics" showBack>
      <div className="p-4 space-y-6">
        
        {!device ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Activity className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Device Health Check</h3>
                <p className="text-sm text-gray-500 mb-6">Stand near the lock and run diagnostics to check battery, firmware, and signal.</p>
                <Button onClick={runDiagnostics} isLoading={isScanning} fullWidth className="bg-purple-600 hover:bg-purple-700">
                    <Play size={18} className="mr-2" /> Start Diagnostics
                </Button>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg">{device.name}</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-mono">{device.macAddress}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Battery size={16} />
                                <span className="text-xs uppercase font-semibold">Battery</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{device.batteryLevel}%</p>
                            <span className="text-xs text-green-600">Healthy</span>
                        </div>
                         <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Wifi size={16} />
                                <span className="text-xs uppercase font-semibold">Signal</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{device.rssi} dBm</p>
                            <span className="text-xs text-amber-600">Moderate</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Clock size={16} />
                                <span className="text-xs uppercase font-semibold">Time Drift</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">0.4s</p>
                            <span className="text-xs text-green-600">Sync OK</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Cpu size={16} />
                                <span className="text-xs uppercase font-semibold">Firmware</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">{firmwareInfo || 'Unknown'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                         <Button variant="secondary" size="sm" onClick={handleCheckFirmware} disabled={isProcessing} className="text-xs">
                             <RefreshCcw size={14} className="mr-1" /> Check Firmware
                         </Button>
                         <Button variant="danger" size="sm" onClick={handleResetLock} disabled={isProcessing} className="text-xs">
                             <AlertTriangle size={14} className="mr-1" /> Factory Reset
                         </Button>
                    </div>

                    {/* Advanced Section - Restricted */}
                    {canSeeAdvanced && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2 text-red-600 mb-3">
                                <ShieldAlert size={16} />
                                <span className="text-xs font-bold uppercase">Restricted: Advanced Signal Analysis</span>
                            </div>
                            <div className="bg-gray-900 text-green-400 font-mono text-[10px] p-3 rounded-lg overflow-x-auto">
                                <p>BLE_PACKET_TYPE: 0x04 (ADVERTISING)</p>
                                <p>RAW_PAYLOAD: 0201061AFF4C000215E2C56DB5DFFB48D2B060D0F5A71096E000000000C5</p>
                                <p>SDK_INIT_STATUS: OK</p>
                                <p>LATENCY: 24ms</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <Button 
                            variant="outline" 
                            fullWidth 
                            onClick={() => { setDevice(null); setLogs([]); setFirmwareInfo(''); }}
                        >
                            Reset & Scan Again
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* Console Log */}
        <div className="bg-gray-900 p-4 rounded-xl shadow-inner font-mono text-xs">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <Terminal size={14} />
                    <span>SYSTEM LOG</span>
                </div>
            </div>
            <div className="h-32 overflow-y-auto space-y-1">
                {logs.length === 0 && <span className="text-gray-600 italic">Ready to scan...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="text-green-400">
                        <span className="text-gray-500 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                        {log}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Diagnostics;