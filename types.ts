
export enum DeviceType {
  LOCK = 'LOCK',
  GATEWAY = 'GATEWAY'
}

export enum ProvisioningStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  CONNECTING = 'CONNECTING',
  ACTIVATING = 'ACTIVATING',
  CLOUD_REGISTERING = 'CLOUD_REGISTERING',
  CONFIGURING = 'CONFIGURING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum UserRole {
  ADMINISTRATOR = 'Administrator',
  SUPERVISOR = 'Supervisor',
  TECHNICIAN = 'Technician'
}

export interface TTLockDevice {
  macAddress: string;
  name: string;
  rssi: number;
  isSettingMode: boolean;
  type: DeviceType;
  batteryLevel?: number;
  firmwareVersion?: string;
}

// Mimics the native SDK "LockData" object string
export interface TTLockData {
  lockId?: number; // Added optional as it comes from cloud sometimes
  lockName: string;
  lockMac: string;
  lockVersion: string;
  adminId: number;
  lockKey: string;
  aesKeyStr: string;
  adminPwd?: string;
  keyId?: number; // Cloud Key ID
}

// TTLock Cloud API Response Types
export interface CloudResponse {
    errcode: number;
    errmsg: string;
    description?: string;
}

export interface CloudLockInitResponse extends CloudResponse {
    lockId: number;
    keyId: number;
}

export interface CloudGatewayInitResponse extends CloudResponse {
    gatewayId: number;
}

// WizSmith Backend Types
export interface Building {
  id: string;
  name: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
}

export interface Room {
  id: string;
  floorId: string;
  name: string;
}

export interface BuildingContext {
  buildingId: string;
  floorId: string;
  roomId: string;
}

export interface DeviceRegistrationPayload {
  deviceType: DeviceType;
  macAddress: string;
  cloudId: number; // LockID or GatewayID from TTLock Cloud
  buildingId: string;
  floorId: string;
  roomId?: string;
  technicianId: string;
  installNotes: string;
  timestamp: number;
}

export interface TechnicianSession {
  token: string;
  username: string;
  role: UserRole;
  expiresAt: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  status: 'pending' | 'synced';
}
