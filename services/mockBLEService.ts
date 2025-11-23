import { TTLockDevice, DeviceType, TTLockData } from '../types';

// --- TTLock Native SDK Simulation ---
// This service mimics the behavior of the official TTLock Android SDK methods.
// In a real native app, these would be bridges to the Java/Kotlin SDK.

export const scanForDevices = (): Promise<TTLockDevice[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockDevices: TTLockDevice[] = [
        {
          macAddress: 'AA:BB:CC:11:22:33',
          name: 'TTLock_3214',
          rssi: -45,
          isSettingMode: true,
          type: DeviceType.LOCK,
          batteryLevel: 95,
          firmwareVersion: '6.2.0'
        },
        {
          macAddress: 'DD:EE:FF:44:55:66',
          name: 'TTLock_Gateway_G2',
          rssi: -62,
          isSettingMode: true,
          type: DeviceType.GATEWAY
        },
        {
          macAddress: '11:22:33:AA:BB:CC',
          name: 'TTLock_9982',
          rssi: -78,
          isSettingMode: false, // Already paired
          type: DeviceType.LOCK,
          batteryLevel: 20,
          firmwareVersion: '6.1.5'
        }
      ];
      resolve(mockDevices);
    }, 2500); // Simulate scan duration
  });
};

export const simulateQRScan = (type: DeviceType): Promise<TTLockDevice> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                macAddress: type === DeviceType.LOCK ? 'QR:AA:BB:CC:DD:EE' : 'QR:GG:HH:II:JJ:KK',
                name: type === DeviceType.LOCK ? 'TTLock_QR_Scan' : 'Gateway_QR_Scan',
                rssi: -30,
                isSettingMode: true,
                type: type,
                batteryLevel: 100,
                firmwareVersion: '6.3.0'
            });
        }, 800);
    });
};

export const connectToDevice = (mac: string): Promise<boolean> => {
    console.log(`[SDK] connecting to ${mac}...`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

/**
 * Simulates TTLockClient.getDefault().initLock(lockData)
 * This is the primary activation method in the SDK.
 */
export const initLock = (mac: string): Promise<TTLockData> => {
    console.log(`[SDK] initLock(${mac}) called`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                lockId: Math.floor(Math.random() * 100000),
                lockName: 'WizSmith_Lock_' + mac.substring(0, 4),
                lockMac: mac,
                lockVersion: '6.4.0',
                adminId: 1,
                lockKey: 'mock_lock_key_123',
                aesKeyStr: 'mock_aes_key_456'
            });
        }, 1500);
    });
}

/**
 * Simulates TTLockClient.getDefault().setAdminKeyboardPassword()
 * Required after initialization.
 */
export const setAdminPassword = (mac: string, password: string): Promise<boolean> => {
    console.log(`[SDK] setAdminKeyboardPassword(${mac}, ***)`);
    return new Promise(resolve => setTimeout(() => resolve(true), 800));
}

/**
 * Simulates TTLockClient.getDefault().calibrationTime()
 * Should be called after initialization to ensure logs are accurate.
 */
export const syncTime = (mac: string): Promise<boolean> => {
    console.log(`[SDK] calibrationTime(${mac})`);
    return new Promise(resolve => setTimeout(() => resolve(true), 600));
}

/**
 * Simulates TTLockClient.getDefault().resetLock()
 * Factory resets the lock (requires admin privileges/device in setting mode).
 */
export const resetLock = (mac: string): Promise<boolean> => {
    console.log(`[SDK] resetLock(${mac})`);
    return new Promise(resolve => setTimeout(() => resolve(true), 2000));
}

/**
 * Simulates TTLockClient.getDefault().getLockVersion()
 */
export const getFirmwareVersion = (mac: string): Promise<string> => {
     console.log(`[SDK] getLockVersion(${mac})`);
     return new Promise(resolve => setTimeout(() => resolve("6.4.2_20231001"), 1200));
}

export const configureGateway = (mac: string, wifiSsid: string): Promise<boolean> => {
    console.log(`[SDK] Configuring gateway ${mac} for WiFi ${wifiSsid}...`);
    return new Promise(resolve => setTimeout(() => resolve(true), 3000));
}