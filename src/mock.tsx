import type { EspProvisioning, WifiAP } from '.'
import EspIdfRn, { eventEmitter } from '.'

const TIMEOUT = 1800
const _EspIdfRn: EspProvisioning = {
	checkPermissions() {
		return Promise.resolve(true)
	},
	startBleScan() {
		setTimeout(() => {
			eventEmitter.emit('scanBle', [
				{ deviceName: 'Casa_29E2', serviceUuid: 'Casa_29E2' },
			])
		}, TIMEOUT)
		setTimeout(() => {
			eventEmitter.emit('scanBle', { status: 1 })
		}, TIMEOUT * 2)
		return Promise.resolve(true)
	},
	stopBleScan() {},
	connectDevice() {
		setTimeout(() => {
			eventEmitter.emit('connection', { status: 1 })
		}, TIMEOUT)
		return Promise.resolve(true)
	},
	disconnectDevice() {},
	startWifiScan() {
		setTimeout(() => {
			eventEmitter.emit('scanWifi', {
				wifiList: [
					{ ssid: 'Spectrum_1521', rssi: -49, auth: 1 },
					{ ssid: 'TMobile_XBDE', rssi: -59, auth: 0 },
					{ ssid: 'Att_XBDE', rssi: -69, auth: 1 },
					{ ssid: 'Verizon_D9E', rssi: -79, auth: 0 },
				] as WifiAP[],
			})
		}, TIMEOUT)
		return Promise.resolve(true)
	},
	doProvisioning() {
		new Promise((resolve) => {
			setTimeout(() => {
				eventEmitter.emit('provisioning', { status: 3 })
				resolve(true)
			}, TIMEOUT)
		}).then(() => {
			setTimeout(() => {
				eventEmitter.emit('provisioning', { status: 5 })
			}, TIMEOUT)
		})
		return Promise.resolve(true)
	},
	sendCertificate() {
		setTimeout(() => {
			eventEmitter.emit('certificate', { status: 1 })
		}, TIMEOUT)
		return Promise.resolve(true)
	},
}
Object.keys(_EspIdfRn).forEach((it) => {
	;(EspIdfRn as any)[it] = (_EspIdfRn as any)[it]
})

export default EspIdfRn

export { useProvisioning } from '.'
