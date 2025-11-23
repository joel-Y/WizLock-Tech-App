import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { scanForDevices } from '../services/mockBLEService';
import { TTLockDevice } from '../types';
import { Bluetooth, RefreshCw } from 'lucide-react';
import Button from '../components/Button';

const BLEScan: React.FC = () => {
  const [devices, setDevices] = useState<TTLockDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
      setScanning(true);
      setDevices([]);
      const res = await scanForDevices();
      setDevices(res);
      setScanning(false);
  }

  useEffect(() => {
      handleScan();
  }, []);

  return (
    <Layout title="Nearby Devices" showBack>
        <div className="p-4">
             <div className="flex justify-end mb-4">
                 <Button size="sm" onClick={handleScan} isLoading={scanning} variant="secondary">
                     <RefreshCw size={16} className="mr-2" /> Refresh
                 </Button>
             </div>

             {scanning && devices.length === 0 && (
                 <div className="text-center py-10">
                     <div className="animate-pulse bg-blue-100 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                         <Bluetooth className="text-blue-500" size={32} />
                     </div>
                     <p className="text-gray-500">Scanning for TTLock devices...</p>
                 </div>
             )}

             <div className="space-y-3">
                 {devices.map((device, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${device.type === 'LOCK' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                 <Bluetooth size={20} />
                             </div>
                             <div>
                                 <h4 className="font-bold text-gray-800">{device.name}</h4>
                                 <p className="text-xs text-gray-500">{device.macAddress} • {device.rssi} dBm</p>
                             </div>
                         </div>
                         <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                             {device.isSettingMode ? 'PAIRING' : 'BOUND'}
                         </span>
                     </div>
                 ))}
             </div>
        </div>
    </Layout>
  );
}

export default BLEScan;