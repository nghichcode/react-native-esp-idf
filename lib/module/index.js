import { NativeModules, NativeEventEmitter, AppState } from 'react-native';
import { useEffect, useState, useRef } from 'react';
const {
  EspIdfRn
} = NativeModules;
export const eventEmitter = new NativeEventEmitter(EspIdfRn);
export default EspIdfRn;
export let ProvisioningStep;

(function (ProvisioningStep) {
  ProvisioningStep[ProvisioningStep["STARTED"] = 0] = "STARTED";
  ProvisioningStep[ProvisioningStep["SCANNING_BLES"] = 1] = "SCANNING_BLES";
  ProvisioningStep[ProvisioningStep["WAITING_CERTIFICATE"] = 2] = "WAITING_CERTIFICATE";
  ProvisioningStep[ProvisioningStep["SCANNING_WIFIS"] = 3] = "SCANNING_WIFIS";
  ProvisioningStep[ProvisioningStep["WAITING_WIFI_CREDENTIALS"] = 4] = "WAITING_WIFI_CREDENTIALS";
  ProvisioningStep[ProvisioningStep["COMPLETE"] = 5] = "COMPLETE";
})(ProvisioningStep || (ProvisioningStep = {}));

export function useProvisioning({
  devicePrefix,
  pop = null,
  message
}) {
  console.log('Invoke func useProvisioning');
  const msg = useRef(message);
  const [bleDevices, setBleDevices] = useState([]);
  const [wifiAPs, setWifiAPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(message.scanBle);
  const isConnecting = useRef(false);
  const [currentStep, setCurrentStep] = useState(ProvisioningStep.SCANNING_BLES);
  const [provSent, setProvSent] = useState(initStep(message.sendingWifiCredential, true));
  const [provApplied, setProvApplied] = useState(initStep(message.confirmWifiConnection));
  const [provFinal, setProvFinal] = useState(initStep(''));
  const currentWifi = useRef();
  const currentDevice = useRef();

  function connectDevice(bleDevice) {
    if (isConnecting.current) return;
    isConnecting.current = true;
    EspIdfRn.stopBleScan();
    console.log('Connect to device:', bleDevice, pop);
    setStatus(message.connectDevice);
    currentDevice.current = bleDevice;
    return EspIdfRn.connectDevice(bleDevice.serviceUuid, pop);
  }

  function configWifi(wifi) {
    console.log('Selected Wifi:', wifi);
    currentWifi.current = wifi;
    setCurrentStep(!wifi.ssid || wifi.auth > 0 ? ProvisioningStep.WAITING_WIFI_CREDENTIALS : ProvisioningStep.COMPLETE);

    if (!wifi.auth) {
      return doProvisioning(wifi);
    }

    return Promise.resolve(true);
  }

  useEffect(() => {
    eventEmitter.addListener('scanWifi', event => {
      console.log('Event scanWifi', event);
      setLoading(false);
      setStatus('');

      if (event.wifiList) {
        setWifiAPs(event.wifiList);
      } else if (event.message) {
        setStatus(event.message);
      }
    });
    return function () {
      console.log('Cleanup the resource');
      EspIdfRn.stopBleScan();
      EspIdfRn.disconnectDevice();
      eventEmitter.removeAllListeners('scanWifi');
    };
  }, []);
  useEffect(() => {
    console.log('Added AppSateChanged listener with step: ', currentStep);

    async function initPermissionCheckAndBleScan() {
      console.log('Start checkPermissions');
      const result = await EspIdfRn.checkPermissions();
      console.log(`checkPermissions result: ${result}`);

      if (result && !isConnecting.current && currentStep === ProvisioningStep.SCANNING_BLES) {
        console.log('Start BleScan with prefix:', devicePrefix);
        setBleDevices([]);
        EspIdfRn.startBleScan(devicePrefix);
      }
    }

    async function _handleAppStateChange(nextAppState) {
      console.log(`AppSateChanged: ${nextAppState}`);

      if (nextAppState === 'active') {
        initPermissionCheckAndBleScan();
      }
    }

    AppState.addEventListener('change', _handleAppStateChange);
    eventEmitter.addListener('permission', event => {
      console.log('Event permission', event);

      if (event.status) {
        if (currentStep === ProvisioningStep.SCANNING_BLES && !isConnecting.current) {
          initPermissionCheckAndBleScan();
        } else if (currentStep === ProvisioningStep.SCANNING_WIFIS) {
          EspIdfRn.startWifiScan();
        }
      } else {
        setStatus(event.type === 1 ? msg.current.enableBluetooth : msg.current.enableLocation);
      }
    }); // Init

    if (currentStep === ProvisioningStep.SCANNING_BLES) {
      initPermissionCheckAndBleScan();
    }

    return function () {
      console.log('Removed AppSateChanged listener');
      eventEmitter.removeAllListeners('permission');
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [currentStep, devicePrefix]);
  useEffect(() => {
    console.log('Added listeners');
    eventEmitter.addListener('scanBle', event => {
      console.log('Event scanBle', event);

      if (event instanceof Array) {
        setBleDevices(event);
      } else if (event.deviceName) {
        setBleDevices(prev => prev.some(it => it.serviceUuid === event.serviceUuid) ? prev : prev.concat(event));
      } else if (event.status === 0) {
        setLoading(false);
        setStatus(msg.current.scanBleFailed);
      } else {
        setLoading(false);
        if (!isConnecting.current) setStatus('');
      }
    });
    eventEmitter.addListener('connection', event => {
      isConnecting.current = false;
      console.log('Event connection', event);

      switch (event.status) {
        case 1:
          //connected
          console.log('Will wait for certificate');
          setCurrentStep(ProvisioningStep.WAITING_CERTIFICATE);
          setStatus(msg.current.waitingCertificate);
          break;

        case 2:
          //failed
          setStatus(msg.current.connectFailed);
          break;

        case 3:
          //disconnected
          setStatus(msg.current.disconnected);
          break;
      }
    });
    eventEmitter.addListener('certificate', event => {
      var _event$message;

      isConnecting.current = false;
      console.log('Event certificate', event);
      console.log('Event certificate message: ', (_event$message = event.message) !== null && _event$message !== void 0 ? _event$message : '');

      switch (event.status) {
        case 1:
          //success
          console.log('Event certificate success!');
          EspIdfRn.startWifiScan();
          setCurrentStep(ProvisioningStep.SCANNING_WIFIS);
          setLoading(true);
          setStatus(msg.current.scanWifi);
          break;

        case 0:
          //failed
          console.log('Event certificate failed!');
          setCurrentStep(ProvisioningStep.STARTED);
          break;
      }
    });
    eventEmitter.addListener('provisioning', event => {
      console.log('Event provisioning', event);

      switch (event.status) {
        case 0:
        case 2:
          setProvSent(doneStep(event.message, true));
          setProvFinal(doneStep(msg.current.initSessionError, true));
          break;

        case 3:
          setProvSent(prev => ({ ...prev,
            done: true
          }));
          setProvApplied(prev => ({ ...prev,
            progress: true
          }));
          break;

        case 5:
          setProvApplied(prev => ({ ...prev,
            done: true
          }));
          setProvFinal(doneStep(msg.current.completed));
          break;

        default:
          setProvApplied(doneStep(event.message, false));
          setProvFinal(doneStep(msg.current.applyError, true));
      }
    });
    return function () {
      console.log('Removed listeners');
      eventEmitter.removeAllListeners('scanBle');
      eventEmitter.removeAllListeners('connection');
      eventEmitter.removeAllListeners('provisioning');
    };
  }, [devicePrefix]);
  return {
    bleDevices,
    wifiAPs,
    loading,
    status,
    currentStep,
    currentWifi,
    currentDevice,
    results: [provSent, provApplied, provFinal],
    setCurrentStep,
    connectDevice,
    configWifi,
    doProvisioning,
    sendCertificate
  };
}

function doProvisioning(_wifi) {
  return EspIdfRn.doProvisioning(_wifi.ssid, 'password' in _wifi ? _wifi.password : '');
}

export function sendCertificate(info) {
  const newInfo = {
    thingName: info.thingName,
    endpointUrl: info.endpointUrl,
    deviceCert: info.deviceCert.replace(/\n/g, ''),
    deviceKey: info.deviceKey.replace(/\n/g, '')
  };
  console.log("Certificate to send: ", newInfo);
  return EspIdfRn.sendCertificate(newInfo.thingName, newInfo.endpointUrl, newInfo.deviceCert, newInfo.deviceKey);
}

function initStep(message, progress = false) {
  return {
    done: false,
    progress,
    failed: false,
    message
  };
}

function doneStep(message, failed = false) {
  return {
    progress: false,
    done: true,
    failed,
    message
  };
}
//# sourceMappingURL=index.js.map