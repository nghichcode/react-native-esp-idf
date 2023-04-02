"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useProvisioning = useProvisioning;
exports.sendCertificate = sendCertificate;
exports.ProvisioningStep = exports.default = exports.eventEmitter = void 0;

var _reactNative = require("react-native");

var _react = require("react");

const {
  EspIdfRn
} = _reactNative.NativeModules;
const eventEmitter = new _reactNative.NativeEventEmitter(EspIdfRn);
exports.eventEmitter = eventEmitter;
var _default = EspIdfRn;
exports.default = _default;
let ProvisioningStep;
exports.ProvisioningStep = ProvisioningStep;

(function (ProvisioningStep) {
  ProvisioningStep[ProvisioningStep["STARTED"] = 0] = "STARTED";
  ProvisioningStep[ProvisioningStep["SCANNING_BLES"] = 1] = "SCANNING_BLES";
  ProvisioningStep[ProvisioningStep["WAITING_CERTIFICATE"] = 2] = "WAITING_CERTIFICATE";
  ProvisioningStep[ProvisioningStep["SCANNING_WIFIS"] = 3] = "SCANNING_WIFIS";
  ProvisioningStep[ProvisioningStep["WAITING_WIFI_CREDENTIALS"] = 4] = "WAITING_WIFI_CREDENTIALS";
  ProvisioningStep[ProvisioningStep["COMPLETE"] = 5] = "COMPLETE";
})(ProvisioningStep || (exports.ProvisioningStep = ProvisioningStep = {}));

function useProvisioning({
  devicePrefix,
  pop = null,
  message
}) {
  console.log('Invoke func useProvisioning');
  const msg = (0, _react.useRef)(message);
  const [bleDevices, setBleDevices] = (0, _react.useState)([]);
  const [wifiAPs, setWifiAPs] = (0, _react.useState)([]);
  const [loading, setLoading] = (0, _react.useState)(true);
  const [status, setStatus] = (0, _react.useState)(message.scanBle);
  const isConnecting = (0, _react.useRef)(false);
  const [currentStep, setCurrentStep] = (0, _react.useState)(ProvisioningStep.SCANNING_BLES);
  const [provSent, setProvSent] = (0, _react.useState)(initStep(message.sendingWifiCredential, true));
  const [provApplied, setProvApplied] = (0, _react.useState)(initStep(message.confirmWifiConnection));
  const [provFinal, setProvFinal] = (0, _react.useState)(initStep(''));
  const currentWifi = (0, _react.useRef)();
  const currentDevice = (0, _react.useRef)();

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

  (0, _react.useEffect)(() => {
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
  (0, _react.useEffect)(() => {
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

    _reactNative.AppState.addEventListener('change', _handleAppStateChange);

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

      _reactNative.AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [currentStep, devicePrefix]);
  (0, _react.useEffect)(() => {
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

function sendCertificate(info) {
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