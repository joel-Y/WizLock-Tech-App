
import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Bluetooth, 
  CheckCircle, 
  MapPin, 
  QrCode,
  Key,
  Clock,
  Shield,
  Cloud
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ProvisioningStatus, DeviceType, TTLockDevice, TTLockData, Building, Floor, Room } from '../types';
import { 
  scanForDevices, 
  connectToDevice, 
  simulateQRScan,
  initLock,
  setAdminPassword,
  syncTime
} from '../services/mockBLEService';
import { registerLockToCloud, assignAdminKey } from '../services/ttlockCloudService';
import { getBuildings, getFloors, getRooms, registerDeviceInBackend, getSession } from '../services/apiService';

const LockProvisioning: React.FC = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<ProvisioningStatus>(ProvisioningStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [scannedDevices, setScannedDevices] = useState<TTLockDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<TTLockDevice | null>(null);
  const [lockData, setLockData] = useState<TTLockData | null>(null);
  
  // Location State
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Assignment Data
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [notes, setNotes] = useState('');

  // Initial Load
  useEffect(() => {
      const loadData = async () => {
          const b = await getBuildings();
          setBuildings(b);
      }
      loadData();
  }, []);

  // Cascading Dropdowns
  useEffect(() => {
      if (selectedBuilding) {
          getFloors(selectedBuilding).then(setFloors);
          setSelectedFloor('');
          setSelectedRoom('');
      }
  }, [selectedBuilding]);

  useEffect(() => {
      if (selectedFloor) {
          getRooms(selectedFloor).then(setRooms);
          setSelectedRoom('');
      }
  }, [selectedFloor]);

  const startScan = async () => {
    setStatus(ProvisioningStatus.SCANNING);
    setScannedDevices([]);
    const devices = await scanForDevices();
    setScannedDevices(devices.filter(d => d.type === DeviceType.LOCK));
    setStatus(ProvisioningStatus.IDLE);
  };

  const startQRScan = async () => {
    setStatus(ProvisioningStatus.SCANNING);
    setScannedDevices([]);
    const device = await simulateQRScan(DeviceType.LOCK);
    setScannedDevices([device]);
    setStatus(ProvisioningStatus.IDLE);
  };

  const handleConnectAndInit = async (device: TTLockDevice) => {
    setSelectedDevice(device);
    try {
      // 1. Connect
      setStatus(ProvisioningStatus.CONNECTING);
      setStatusMessage('Connecting to lock Bluetooth...');
      await connectToDevice(device.macAddress);

      // 2. Initialize (Activate via BLE)
      setStatus(ProvisioningStatus.ACTIVATING);
      setStatusMessage('Initializing Lock (SDK initLock)...');
      const data = await initLock(device.macAddress);
      
      // 3. Set Admin Password (BLE)
      setStatusMessage('Setting Admin Password...');
      await setAdminPassword(device.macAddress, 'admin123');

      // 4. Sync Time (BLE)
      setStatusMessage('Calibrating Lock Time...');
      await syncTime(device.macAddress);

      // 5. Register with Cloud (API)
      setStatus(ProvisioningStatus.CLOUD_REGISTERING);
      setStatusMessage('Registering with TTLock Cloud...');
      const cloudResponse = await registerLockToCloud(data, `Lock_${device.macAddress.replace(/:/g, '')}`);
      
      // 6. Generate Admin Key (API)
      setStatusMessage('Generating Admin Key...');
      await assignAdminKey(cloudResponse.lockId);

      // Update local state with cloud ID
      setLockData({ ...data, lockId: cloudResponse.lockId });

      setStatus(ProvisioningStatus.IDLE);
      setStep(2); // Move to assignment
    } catch (e) {
      console.error(e);
      setStatus(ProvisioningStatus.ERROR);
      setStatusMessage('Provisioning failed. Try again.');
    }
  };

  const handleFinish = async () => {
    if (!selectedDevice || !lockData) return;
    setStatus(ProvisioningStatus.CONFIGURING);
    
    try {
        const session = getSession();
        await registerDeviceInBackend({
            deviceType: DeviceType.LOCK,
            macAddress: selectedDevice.macAddress,
            cloudId: lockData.lockId!,
            buildingId: selectedBuilding,
            floorId: selectedFloor,
            roomId: selectedRoom,
            technicianId: session?.username || 'unknown',
            installNotes: notes,
            timestamp: Date.now()
        });

        setStatus(ProvisioningStatus.SUCCESS);
        setStep(3);
    } catch (e) {
        setStatus(ProvisioningStatus.ERROR);
        setStatusMessage("Failed to sync with WizSmith Backend.");
    }
  };

  const renderStep1_Scan = () => (
    <div className="space-y-6">
      <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-sm mb-4">
          <Bluetooth className={`w-10 h-10 text-wiz-blue ${status === ProvisioningStatus.SCANNING ? 'animate-pulse' : ''}`} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Scan for Locks</h3>
        <p className="text-sm text-gray-500 mb-6">Wake up the lock keypad or scan the QR code on the battery cover.</p>
        
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={startScan} 
            isLoading={status === ProvisioningStatus.SCANNING}
            variant="primary"
          >
            BLE Scan
          </Button>
          <Button 
            onClick={startQRScan} 
            disabled={status === ProvisioningStatus.SCANNING}
            variant="outline"
            icon={<QrCode size={18} />}
          >
            QR Code
          </Button>
        </div>
      </div>

      {scannedDevices.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-1">Available Devices</p>
          {scannedDevices.map(d => (
            <div key={d.macAddress} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{d.name}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{d.macAddress}</span>
                   <span className={`text-xs px-2 py-0.5 rounded ${d.isSettingMode ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {d.isSettingMode ? 'Ready' : 'Bound'}
                   </span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="primary" 
                onClick={() => handleConnectAndInit(d)}
                disabled={!d.isSettingMode}
                className="py-2 px-4 text-sm"
              >
                Setup
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {(status === ProvisioningStatus.CONNECTING || status === ProvisioningStatus.ACTIVATING || status === ProvisioningStatus.CLOUD_REGISTERING) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl text-center max-w-xs w-full mx-4">
                <div className="animate-spin w-10 h-10 border-4 border-wiz-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-lg">Configuring Device</h3>
                <p className="text-sm text-gray-500 mt-2">{statusMessage}</p>
                <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400 text-left mx-auto w-fit">
                    <div className="flex items-center gap-2">
                        <Bluetooth size={12} className={status === ProvisioningStatus.CONNECTING ? 'text-blue-500' : 'text-green-500'} />
                        Bluetooth Connect
                    </div>
                    <div className="flex items-center gap-2">
                        <Key size={12} className={status === ProvisioningStatus.ACTIVATING && statusMessage.includes('Init') ? 'text-blue-500' : (lockData ? 'text-green-500' : '')} />
                        Initialize Lock
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={12} className={statusMessage.includes('Password') ? 'text-blue-500' : (lockData?.adminPwd ? 'text-green-500' : '')} />
                        Set Admin Password
                    </div>
                    <div className="flex items-center gap-2">
                        <Cloud size={12} className={status === ProvisioningStatus.CLOUD_REGISTERING ? 'text-blue-500' : (lockData?.lockId ? 'text-green-500' : '')} />
                        Cloud Registration
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );

  const renderStep2_Assign = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-3">
        <div className="flex items-start gap-3">
           <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
           <div>
              <p className="font-bold text-green-800">Initialization Successful</p>
              <p className="text-sm text-green-700">MAC: {selectedDevice?.macAddress}</p>
           </div>
        </div>
        {lockData && (
            <div className="bg-white/60 p-2 rounded text-xs text-green-800 font-mono">
                Cloud ID: {lockData.lockId}<br/>
                Ver: {lockData.lockVersion}<br/>
                Admin: ESTABLISHED
            </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
           <MapPin size={18} className="text-wiz-blue" />
           Location Assignment
        </h3>
        
        <div className="space-y-3">
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Building</label>
             <select 
                value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-blue outline-none"
             >
                <option value="">Select Building</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Floor</label>
             <select 
                value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}
                disabled={!selectedBuilding}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-blue outline-none disabled:bg-gray-50 disabled:text-gray-400"
             >
                <option value="">Select Floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Room</label>
             <select 
                value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedFloor}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-blue outline-none disabled:bg-gray-50 disabled:text-gray-400"
             >
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Install Notes</label>
             <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Serial Number, specific install location on door..."
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-blue outline-none text-sm"
                rows={2}
             />
          </div>
        </div>
      </div>

      <Button 
        fullWidth 
        onClick={handleFinish} 
        disabled={!selectedBuilding || !selectedFloor || !selectedRoom}
        isLoading={status === ProvisioningStatus.CONFIGURING}
      >
        Complete Setup
      </Button>
    </div>
  );

  const renderStep3_Success = () => (
      <div className="text-center py-10">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">The lock has been successfully provisioned, registered to WizSmith, and assigned to the selected room.</p>
          
          <Button fullWidth onClick={() => {
              setStep(1);
              setSelectedDevice(null);
              setScannedDevices([]);
              setLockData(null);
              setNotes('');
              setSelectedBuilding('');
              setSelectedFloor('');
              setSelectedRoom('');
          }}>
              Provision Another Lock
          </Button>
      </div>
  );

  return (
    <Layout title="New Installation" showBack>
      <div className="px-4 py-6">
        {/* Stepper */}
        {step < 3 && (
            <div className="flex items-center justify-between px-8 mb-8">
            <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-wiz-blue text-white' : 'bg-gray-200'}`}>1</div>
                <span className="text-xs text-gray-500">Scan</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-wiz-blue' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-wiz-blue text-white' : 'bg-gray-200'}`}>2</div>
                <span className="text-xs text-gray-500">Assign</span>
            </div>
            </div>
        )}

        {step === 1 && renderStep1_Scan()}
        {step === 2 && renderStep2_Assign()}
        {step === 3 && renderStep3_Success()}
      </div>
    </Layout>
  );
};

export default LockProvisioning;
