# react-native-esp-idf

ESP IDF Provisioning

## Installation

```sh
npm install react-native-esp-idf
```

## Usage

```js
import EspIdfRn, { useProvisioning } from 'react-native-esp-idf';


// ...

const devicePrefix = 'PROV_'
	const message: MessageInfo = {
		scanBle: 'Searching device...',
		waitingCertificate: 'Waiting for certificates...',
		scanWifi: 'Searching available Wi-Fi...',
		connectDevice: 'Connecting your device...',
		sendingWifiCredential: 'Sending Wi-Fi credentials',
		confirmWifiConnection: 'Confirming Wi-Fi connection',
		enableBluetooth: 'Please enable the Bluetooth to start scan device.',
		enableLocation:
			'Please grant location permission to start scan device.',
		scanBleFailed: 'Scan device failed, please try again.',
		connectFailed: 'Connect to device failed, please try again.',
		disconnected: 'device disconnected, please try again.',
		initSessionError: 'Reboot your device and retry.',
		applyError: 'Reset your device and retry.',
		completed: 'Device has been successfully provisioned!',
	}
	const {
		bleDevices,
		wifiAPs,
		loading,
		status,
		currentStep,
		currentWifi,
		currentDevice,
		results,
		setCurrentStep,
		configWifi,
		connectDevice,
		doProvisioning,
		sendCertificate,
	} = useProvisioning({ devicePrefix, message, pop: 'abcd1234' })
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
