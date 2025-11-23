
import { TTLockData, CloudLockInitResponse, CloudGatewayInitResponse } from "../types";

// --- TTLock Cloud API Simulation ---
// This service mimics calls to https://euopen.ttlock.com/v3/
// In the Native Android App, these would be Retrofit calls.

const API_BASE_URL = "https://euopen.ttlock.com/v3";
const CLIENT_ID = "mock_client_id_wizsmith";
const ACCESS_TOKEN = "mock_access_token_technician";

/**
 * Simulates calling: POST /v3/lock/initialize
 * Registers the initialized lock data to the TTLock Cloud.
 * 
 * @param lockDataJson The JSON string returned by the SDK initLock() method
 * @param alias User friendly name for the lock (e.g. Room 101)
 */
export const registerLockToCloud = async (lockData: TTLockData, alias: string): Promise<CloudLockInitResponse> => {
    console.log(`[Cloud API] POST ${API_BASE_URL}/lock/initialize`);
    console.log(`[Payload] lockData=${JSON.stringify(lockData)}, alias=${alias}, clientId=${CLIENT_ID}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                errcode: 0,
                errmsg: "Success",
                lockId: lockData.lockId || Math.floor(Math.random() * 99999),
                keyId: Math.floor(Math.random() * 999999)
            });
        }, 1200);
    });
};

/**
 * Simulates calling: POST /v3/lock/assign
 * (Conceptually similar to generating the initial Admin Key for the WizSmith Master Account)
 */
export const assignAdminKey = async (lockId: number): Promise<boolean> => {
    console.log(`[Cloud API] POST ${API_BASE_URL}/key/send`);
    console.log(`[Payload] lockId=${lockId}, receiverUsername=wizsmith_master_admin`);

    return new Promise(resolve => setTimeout(() => resolve(true), 800));
}

/**
 * Simulates calling: POST /v3/gateway/isInit
 * Checks if gateway is initialized and binds it to the account.
 */
export const registerGatewayToCloud = async (mac: string, ssid: string): Promise<CloudGatewayInitResponse> => {
    console.log(`[Cloud API] POST ${API_BASE_URL}/gateway/isInit`);
    console.log(`[Payload] mac=${mac}, ssid=${ssid}, uid=${CLIENT_ID}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                errcode: 0,
                errmsg: "Success",
                gatewayId: Math.floor(Math.random() * 55555)
            });
        }, 1500);
    });
}

/**
 * Simulates calling: POST /v3/lock/updateDate
 * Ensures cloud timestamp matches lock timestamp.
 */
export const syncLockClock = async (lockId: number): Promise<boolean> => {
    console.log(`[Cloud API] POST ${API_BASE_URL}/lock/updateDate`);
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
}
