"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "useProvisioning", {
  enumerable: true,
  get: function () {
    return _.useProvisioning;
  }
});
exports.default = void 0;

var _ = _interopRequireWildcard(require("."));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const TIMEOUT = 1800;
const _EspIdfRn = {
  checkPermissions() {
    return Promise.resolve(true);
  },

  startBleScan() {
    setTimeout(() => {
      _.eventEmitter.emit('scanBle', [{
        deviceName: 'Casa_29E2',
        serviceUuid: 'Casa_29E2'
      }]);
    }, TIMEOUT);
    setTimeout(() => {
      _.eventEmitter.emit('scanBle', {
        status: 1
      });
    }, TIMEOUT * 2);
    return Promise.resolve(true);
  },

  stopBleScan() {},

  connectDevice() {
    setTimeout(() => {
      _.eventEmitter.emit('connection', {
        status: 1
      });
    }, TIMEOUT);
    return Promise.resolve(true);
  },

  disconnectDevice() {},

  startWifiScan() {
    setTimeout(() => {
      _.eventEmitter.emit('scanWifi', {
        wifiList: [{
          ssid: 'Spectrum_1521',
          rssi: -49,
          auth: 1
        }, {
          ssid: 'TMobile_XBDE',
          rssi: -59,
          auth: 0
        }, {
          ssid: 'Att_XBDE',
          rssi: -69,
          auth: 1
        }, {
          ssid: 'Verizon_D9E',
          rssi: -79,
          auth: 0
        }]
      });
    }, TIMEOUT);
    return Promise.resolve(true);
  },

  doProvisioning() {
    new Promise(resolve => {
      setTimeout(() => {
        _.eventEmitter.emit('provisioning', {
          status: 3
        });

        resolve(true);
      }, TIMEOUT);
    }).then(() => {
      setTimeout(() => {
        _.eventEmitter.emit('provisioning', {
          status: 5
        });
      }, TIMEOUT);
    });
    return Promise.resolve(true);
  },

  sendCertificate() {
    setTimeout(() => {
      _.eventEmitter.emit('certificate', {
        status: 1
      });
    }, TIMEOUT);
    return Promise.resolve(true);
  }

};
Object.keys(_EspIdfRn).forEach(it => {
  ;
  _.default[it] = _EspIdfRn[it];
});
var _default = _.default;
exports.default = _default;
//# sourceMappingURL=mock.js.map