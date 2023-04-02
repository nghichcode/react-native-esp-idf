/// <reference types="react" />
import { NativeEventEmitter, EmitterSubscription } from 'react-native';
export declare type EspProvisioning = {
    /**
     * check if has proper permissions, if not will request the needed permissions at native
     */
    checkPermissions(): Promise<boolean>;
    /**
     * search BLE ESP device
     * @param prefix prefix of device name
     */
    startBleScan(prefix: string | null): Promise<boolean>;
    stopBleScan(): void;
    /**
     * connect to an ESP device
     * @param uuid device serviceID
     * @param pop proof of possession
     */
    connectDevice(uuid: string, pop: string | null): Promise<boolean>;
    /**
     * disconnect the connected ESP device
     */
    disconnectDevice(): void;
    /**
     *
     */
    startWifiScan(): Promise<boolean>;
    /**
     * provisioning Wi-Fi configuration
     * @param ssidValue Wi-Fi SSID
     * @param passphraseValue password
     */
    doProvisioning(ssidValue: string, passphraseValue: string): Promise<boolean>;
    /**
     * send a certificate
     * @param thingName BLE name of the device
     * @param endpointUrl AWS endpoint that depends on the environment
     * @param deviceCert Certificate
     * @param deviceKey Certificate's key
     */
    sendCertificate(thingName: string, endpointUrl: string, deviceCert: string, deviceKey: string): Promise<boolean>;
};
declare enum BleScanStatus {
    FAILED = 0,
    COMPLETED = 1
}
export interface BleScanEvent {
    status: BleScanStatus;
}
export interface BleDevice {
    deviceName: string;
    serviceUuid: string;
}
declare type BleScanEventListener = (event: BleScanEvent | BleDevice | BleDevice[]) => void;
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'scanBle', listener: BleScanEventListener): EmitterSubscription;
}
declare enum DeviceConnectionStatus {
    CONNECTED = 1,
    FAILED = 2,
    DISCONNECTED = 3
}
export interface DeviceConnectionEvent {
    status: DeviceConnectionStatus;
}
declare type DeviceConnectionEventListener = (event: DeviceConnectionEvent) => void;
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'connection', listener: DeviceConnectionEventListener): EmitterSubscription;
}
declare enum WifiScanStatus {
    FAILED = 0
}
declare enum WifiAuthMode {
    WIFI_UNKNOWN = -1,
    WIFI_OPEN = 0,
    WIFI_WEP = 1,
    WIFI_WPA_PSK = 2,
    WIFI_WPA2_PSK = 3,
    WIFI_WPA_WPA2_PSK = 4,
    WIFI_WPA2_ENTERPRISE = 5
}
export interface WifiAP {
    ssid: string;
    auth: WifiAuthMode;
    rssi: number;
}
export declare type WifiAPWithPwd = WifiAP & {
    password: string;
};
export interface WifiScanEvent {
    status?: WifiScanStatus;
    message?: string;
    wifiList?: WifiAP[];
}
declare type WifiScanEventListener = (event: WifiScanEvent) => void;
export interface CertificateInfo {
    thingName: string;
    endpointUrl: string;
    deviceCert: string;
    deviceKey: string;
}
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'scanWifi', listener: WifiScanEventListener): EmitterSubscription;
}
declare enum PermissionType {
    REQUEST_ENABLE_BT = 1,
    REQUEST_FINE_LOCATION = 2
}
declare enum PermissionStatus {
    UNKNOWN = 0,
    LIMITED = 1,
    DENIED = 2,
    ALLOWED = 3
}
export interface PermissionEvent {
    type: PermissionType;
    status: PermissionStatus;
}
declare type PermissionEventListener = (event: PermissionEvent) => void;
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'permission', listener: PermissionEventListener): EmitterSubscription;
}
declare enum ProvisioningStatus {
    PROV_INIT_FAILED = 0,
    PROV_CONFIG_SENT = 1,
    PROV_CONFIG_FAILED = 2,
    PROV_CONFIG_APPLIED = 3,
    PROV_APPLY_FAILED = 4,
    PROV_COMPLETED = 5,
    PROV_FAILED = 6
}
export interface ProvisioningEvent {
    status: ProvisioningStatus;
    message?: string;
}
declare type ProvisioningEventListener = (event: ProvisioningEvent) => void;
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'provisioning', listener: ProvisioningEventListener): EmitterSubscription;
}
declare enum CertificateStatus {
    FAILED = 0,
    COMPLETED = 1
}
export interface CertificateEvent {
    status: CertificateStatus;
    message?: string;
}
declare type SendCertificateEventListener = (event: CertificateEvent) => void;
export interface EspEventEmitter extends NativeEventEmitter {
    addListener(eventType: 'certificate', listener: SendCertificateEventListener): EmitterSubscription;
}
declare const EspIdfRn: EspProvisioning;
export declare const eventEmitter: EspEventEmitter;
export default EspIdfRn;
export declare type MessageInfo = {
    scanBle: string;
    waitingCertificate: string;
    scanWifi: string;
    connectDevice: string;
    sendingWifiCredential: string;
    confirmWifiConnection: string;
    enableBluetooth: string;
    enableLocation: string;
    scanBleFailed: string;
    connectFailed: string;
    disconnected: string;
    initSessionError: string;
    completed: string;
    applyError: string;
};
declare type ProvisioningProps = {
    devicePrefix: string | null;
    pop?: string | null;
    message: MessageInfo;
};
export declare enum ProvisioningStep {
    STARTED = 0,
    SCANNING_BLES = 1,
    WAITING_CERTIFICATE = 2,
    SCANNING_WIFIS = 3,
    WAITING_WIFI_CREDENTIALS = 4,
    COMPLETE = 5
}
export declare function useProvisioning({ devicePrefix, pop, message, }: ProvisioningProps): {
    bleDevices: BleDevice[];
    wifiAPs: WifiAP[];
    loading: boolean;
    status: string;
    currentStep: ProvisioningStep;
    currentWifi: import("react").MutableRefObject<WifiAP | undefined>;
    currentDevice: import("react").MutableRefObject<BleDevice | undefined>;
    results: ProvisioningStepStatus[];
    setCurrentStep: import("react").Dispatch<import("react").SetStateAction<ProvisioningStep>>;
    connectDevice: (bleDevice: BleDevice) => Promise<boolean> | undefined;
    configWifi: (wifi: WifiAP) => Promise<boolean>;
    doProvisioning: typeof doProvisioning;
    sendCertificate: typeof sendCertificate;
};
declare function doProvisioning(_wifi: WifiAP | WifiAPWithPwd): Promise<boolean>;
export declare function sendCertificate(info: CertificateInfo): Promise<boolean>;
export declare type ProvisioningStepStatus = {
    done: boolean;
    progress: boolean;
    failed: boolean;
    message: string;
};
