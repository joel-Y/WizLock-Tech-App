
import React, { useState, useEffect } from 'react';
import { 
  Router, 
  Wifi, 
  CheckCircle, 
  MapPin, 
  QrCode,
  Server,
  Cloud
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ProvisioningStatus, DeviceType, TTLockDevice, Building, Floor } from '../types';
import { scanForDevices, connectToDevice, configureGateway, simulateQRScan } from '../services/mockBLEService';
import { registerGatewayToCloud } from '../services/ttlockCloudService';
import { getBuildings, getFloors, registerDeviceInBackend, getSession } from '../services/apiService';

const GatewayProvisioning: React.FC = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<ProvisioningStatus>(ProvisioningStatus.IDLE);
  const [scannedDevices, setScannedDevices] = useState<TTLockDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<TTLockDevice | null>(null);
  const [gatewayId, setGatewayId] = useState<number | null>(null);
  
  // Wifi Config
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');

  // Location State
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  // Assignment Data
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
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
    }
  }, [selectedBuilding]);

  const startScan = async () => {
    setStatus(ProvisioningStatus.SCANNING);
    setScannedDevices([]);
    const devices = await scanForDevices();
    setScannedDevices(devices.filter(d => d.type === DeviceType.GATEWAY));
    setStatus(ProvisioningStatus.IDLE);
  };

  const startQRScan = async () => {
    setStatus(ProvisioningStatus.SCANNING);
    setScannedDevices([]);
    const device = await simulateQRScan(DeviceType.GATEWAY);
    setScannedDevices([device]);
    setStatus(ProvisioningStatus.IDLE);
  };

  const handleConnectAndConfigure = async () => {
    if (!selectedDevice) return;
    setStatus(ProvisioningStatus.CONNECTING);
    try {
        // 1. Connect BLE
        await connectToDevice(selectedDevice.macAddress);
        
        // 2. Config WiFi via BLE
        setStatus(ProvisioningStatus.CONFIGURING);
        await configureGateway(selectedDevice.macAddress, wifiSSID);
        
        // 3. Register with Cloud
        setStatus(ProvisioningStatus.CLOUD_REGISTERING);
        const cloudRes = await registerGatewayToCloud(selectedDevice.macAddress, wifiSSID);
        setGatewayId(cloudRes.gatewayId);

        setStatus(ProvisioningStatus.IDLE);
        setStep(3); // Move to assignment
    } catch (e) {
        setStatus(ProvisioningStatus.ERROR);
    }
  };

  const handleFinish = async () => {
    if (!selectedDevice || !gatewayId) return;
    setStatus(ProvisioningStatus.ACTIVATING);
    
    try {
        const session = getSession();
        await registerDeviceInBackend({
            deviceType: DeviceType.GATEWAY,
            macAddress: selectedDevice.macAddress,
            cloudId: gatewayId,
            buildingId: selectedBuilding,
            floorId: selectedFloor,
            technicianId: session?.username || 'unknown',
            installNotes: notes,
            timestamp: Date.now()
        });

        setStatus(ProvisioningStatus.SUCCESS);
        setStep(4);
    } catch (e) {
        setStatus(ProvisioningStatus.ERROR);
    }
  };

  const renderStep1_Scan = () => (
    <div className="space-y-6">
      <div className="text-center p-6 bg-orange-50 rounded-2xl border border-orange-100">
        <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-sm mb-4">
          <Router className={`w-10 h-10 text-wiz-orange ${status === ProvisioningStatus.SCANNING ? 'animate-pulse' : ''}`} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Add Gateway</h3>
        <p className="text-sm text-gray-500 mb-6">Power on the gateway. Ensure blue light is flashing.</p>
        
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={startScan} 
            isLoading={status === ProvisioningStatus.SCANNING}
            variant="secondary"
          >
            Scan BLE
          </Button>
           <Button 
            onClick={startQRScan} 
            disabled={status === ProvisioningStatus.SCANNING}
            variant="outline"
            icon={<QrCode size={18} />}
          >
            Scan QR
          </Button>
        </div>
      </div>

      {scannedDevices.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-1">Found Gateways</p>
          {scannedDevices.map(d => (
            <div key={d.macAddress} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{d.name}</p>
                <p className="text-xs text-gray-500">{d.macAddress}</p>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => { setSelectedDevice(d); setStep(2); }}
              >
                Setup
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2_WiFi = () => (
      <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <Wifi size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900">Network Setup</h3>
                      <p className="text-sm text-gray-500">Connect {selectedDevice?.name} to WiFi</p>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WiFi SSID</label>
                      <input 
                        type="text" 
                        value={wifiSSID} 
                        onChange={(e) => setWifiSSID(e.target.value)}
                        placeholder="e.g. WizSmith_Guest"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-wiz-orange focus:ring-1 focus:ring-wiz-orange"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                      <input 
                        type="password" 
                        value={wifiPass} 
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="Enter WiFi Password"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-wiz-orange focus:ring-1 focus:ring-wiz-orange"
                      />
                  </div>
              </div>
          </div>

          <Button 
            fullWidth 
            variant="secondary"
            onClick={handleConnectAndConfigure}
            disabled={!wifiSSID || !wifiPass}
            isLoading={status === ProvisioningStatus.CONFIGURING || status === ProvisioningStatus.CONNECTING || status === ProvisioningStatus.CLOUD_REGISTERING}
          >
             {status === ProvisioningStatus.CLOUD_REGISTERING ? 'Registering...' : 'Configure & Bind'}
          </Button>

          {status === ProvisioningStatus.CLOUD_REGISTERING && (
              <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Cloud size={14} className="animate-bounce" />
                  Connecting to TTLock Cloud API...
              </div>
          )}
      </div>
  );

  const renderStep3_Assign = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-2">
        <div className="flex items-start gap-3">
           <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
           <div>
              <p className="font-bold text-green-800">Gateway Online</p>
              <p className="text-sm text-green-700">Device is bound to account.</p>
           </div>
        </div>
        <div className="bg-white/60 p-2 rounded text-xs text-green-800 font-mono">
            Cloud ID: {gatewayId}<br/>
            SSID: {wifiSSID}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
           <MapPin size={18} className="text-wiz-orange" />
           Gateway Location
        </h3>
        
        <div className="space-y-3">
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Building</label>
             <select 
                value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-orange outline-none"
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
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-orange outline-none disabled:bg-gray-50 disabled:text-gray-400"
             >
                <option value="">Select Floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Install Notes</label>
             <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Hidden above drop ceiling near Room 101..."
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-wiz-orange outline-none text-sm"
                rows={2}
             />
          </div>
        </div>
      </div>

      <Button 
        fullWidth 
        variant="secondary"
        onClick={handleFinish} 
        disabled={!selectedBuilding || !selectedFloor}
        isLoading={status === ProvisioningStatus.ACTIVATING}
      >
        Complete Setup
      </Button>
    </div>
  );

  const renderStep4_Success = () => (
      <div className="text-center py-10">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gateway Setup Complete!</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">The gateway is now online and syncing lock data for the selected floor.</p>
          
          <Button fullWidth variant="secondary" onClick={() => {
              setStep(1);
              setSelectedDevice(null);
              setScannedDevices([]);
              setNotes('');
              setSelectedBuilding('');
              setSelectedFloor('');
              setWifiSSID('');
              setWifiPass('');
              setGatewayId(null);
          }}>
              Add Another Gateway
          </Button>
      </div>
  );

  return (
    <Layout title="Gateway Setup" showBack>
      <div className="px-4 py-6">
        {/* Stepper */}
        {step < 4 && (
            <div className="flex items-center justify-between px-8 mb-8">
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-wiz-orange text-white' : 'bg-gray-200'}`}>1</div>
                    <span className="text-xs text-gray-500">Scan</span>
                </div>
                <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-wiz-orange' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-wiz-orange text-white' : 'bg-gray-200'}`}>2</div>
                    <span className="text-xs text-gray-500">WiFi</span>
                </div>
                <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-wiz-orange' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-wiz-orange text-white' : 'bg-gray-200'}`}>3</div>
                    <span className="text-xs text-gray-500">Assign</span>
                </div>
            </div>
        )}

        {step === 1 && renderStep1_Scan()}
        {step === 2 && renderStep2_WiFi()}
        {step === 3 && renderStep3_Assign()}
        {step === 4 && renderStep4_Success()}
      </div>
    </Layout>
  );
};

export default GatewayProvisioning;
