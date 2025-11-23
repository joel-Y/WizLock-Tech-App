
import { ActivityLog, TechnicianSession, UserRole, Building, Floor, Room, DeviceRegistrationPayload } from "../types";
import { MOCK_BUILDINGS, MOCK_FLOORS, MOCK_ROOMS } from "../constants";

const STORAGE_KEY_SESSION = 'wizsmith_session';
const STORAGE_KEY_LOGS = 'wizsmith_logs';

// --- Authentication ---

export const loginTechnician = async (username: string, password: string): Promise<TechnicianSession> => {
  // Simulate network delay for backend login endpoint
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (username && password) {
    // Role Assignment Logic (Simulating backend role return)
    let role = UserRole.TECHNICIAN;
    const u = username.toLowerCase();
    
    if (u.includes('admin')) {
      role = UserRole.ADMINISTRATOR;
    } else if (u.includes('super') || u.includes('supervisor')) {
      role = UserRole.SUPERVISOR;
    }

    const session: TechnicianSession = {
      token: 'mock-jwt-token-' + Date.now(),
      username: username,
      role: role,
      expiresAt: Date.now() + 3600000 * 8 // 8 hours
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return session;
  }
  throw new Error("Invalid credentials");
};

export const getSession = (): TechnicianSession | null => {
  const data = localStorage.getItem(STORAGE_KEY_SESSION);
  if (data) {
    return JSON.parse(data) as TechnicianSession;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

// --- Location Services (WizSmith Backend) ---

export const getBuildings = async (): Promise<Building[]> => {
    // GET /api/v1/locations/buildings
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_BUILDINGS;
};

export const getFloors = async (buildingId: string): Promise<Floor[]> => {
    // GET /api/v1/locations/buildings/{id}/floors
    await new Promise(resolve => setTimeout(resolve, 300));
    // Filter mocks for demo
    const floors = buildingId === 'b1' ? MOCK_FLOORS : MOCK_FLOORS.slice(0, 1);
    // Assign buildingId to satisfy type definition
    return floors.map(f => ({ ...f, buildingId }));
};

export const getRooms = async (floorId: string): Promise<Room[]> => {
    // GET /api/v1/locations/floors/{id}/rooms
    await new Promise(resolve => setTimeout(resolve, 300));
    // Assign floorId to satisfy type definition
    return MOCK_ROOMS.map(r => ({ ...r, floorId }));
};

// --- Device Registration (WizSmith Backend) ---

export const registerDeviceInBackend = async (payload: DeviceRegistrationPayload): Promise<boolean> => {
    // POST /api/v1/devices/register
    console.log('[Backend] Registering Device:', payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Also log this locally
    logActivity('BACKEND_REGISTER', `Registered ${payload.deviceType} ${payload.macAddress}`);
    return true;
};

// --- Activity Logs ---

export const logActivity = (action: string, details: string) => {
  const logsRaw = localStorage.getItem(STORAGE_KEY_LOGS);
  const logs: ActivityLog[] = logsRaw ? JSON.parse(logsRaw) : [];
  
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    details,
    status: navigator.onLine ? 'synced' : 'pending'
  };
  
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  return newLog;
};

export const getPendingLogsCount = (): number => {
    const logsRaw = localStorage.getItem(STORAGE_KEY_LOGS);
    const logs: ActivityLog[] = logsRaw ? JSON.parse(logsRaw) : [];
    return logs.filter(l => l.status === 'pending').length;
}

export const syncLogs = async (): Promise<number> => {
    const logsRaw = localStorage.getItem(STORAGE_KEY_LOGS);
    let logs: ActivityLog[] = logsRaw ? JSON.parse(logsRaw) : [];
    const pending = logs.filter(l => l.status === 'pending');
    
    if (pending.length === 0) return 0;

    // Simulate POST /api/v1/logs/bulk
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logs = logs.map(l => ({ ...l, status: 'synced' }));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    
    return pending.length;
}