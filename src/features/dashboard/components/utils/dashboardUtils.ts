export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 10) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

export interface Sensor {
  label: string;
  value: number | string;
  unit: string;
  status: 'GOOD' | 'BAD';
  raw?: number;
  voltage?: number;
  calibrated?: number;
  calibrated_ok?: boolean;
}

export const parseSensorData = (payload: any): Sensor[] => {
  const sensors: Sensor[] = [];

  // pH Sensor
  if (payload.ph) {
    sensors.push({
      label: 'pH',
      value:
        typeof payload.ph.calibrated === 'number'
          ? payload.ph.calibrated.toFixed(2)
          : typeof payload.ph.raw === 'number'
            ? payload.ph.raw.toFixed(2)
            : '-',
      unit: '',
      status: payload.ph.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: payload.ph.raw,
      voltage: payload.ph.voltage,
      calibrated: payload.ph.calibrated,
      calibrated_ok: payload.ph.calibrated_ok,
    });
  }

  // TDS Sensor
  if (payload.tds) {
    sensors.push({
      label: 'TDS',
      value:
        typeof payload.tds.calibrated === 'number'
          ? payload.tds.calibrated.toFixed(1)
          : typeof payload.tds.raw === 'number'
            ? payload.tds.raw.toFixed(1)
            : '-',
      unit: 'ppm',
      status: payload.tds.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: payload.tds.raw,
      voltage: payload.tds.voltage,
      calibrated: payload.tds.calibrated,
      calibrated_ok: payload.tds.calibrated_ok,
    });
  }

  // DO Sensor
  if (payload.do_level) {
    sensors.push({
      label: 'DO',
      value:
        typeof payload.do_level.calibrated === 'number'
          ? payload.do_level.calibrated.toFixed(2)
          : typeof payload.do_level.raw === 'number'
            ? payload.do_level.raw.toFixed(2)
            : '-',
      unit: 'mg/L',
      status: payload.do_level.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: payload.do_level.raw,
      voltage: payload.do_level.voltage,
      calibrated: payload.do_level.calibrated,
      calibrated_ok: payload.do_level.calibrated_ok,
    });
  }

  // Temperature Sensor
  if (payload.temperature) {
    sensors.push({
      label: 'Suhu',
      value:
        typeof payload.temperature.value === 'number' ? payload.temperature.value.toFixed(1) : '-',
      unit: '°C',
      status: payload.temperature.status === 'GOOD' ? 'GOOD' : 'BAD',
    });
  }

  return sensors;
};

export const formatIndonesianDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export const updateDeviceData = (
  deviceId: string,
  data: any,
  setDevices: any,
  setLastUpdate: any,
  parseSensorData: any,
  determineDeviceStatus: any,
) => {
  console.log(`🔄 Updating device ${deviceId} with real-time data`);
  
  setDevices((prevDevices: any) => {
    const device = prevDevices[deviceId];
    if (!device) {
      console.warn(`Device ${deviceId} not found in state`);
      return prevDevices;
    }

    const newSensors = parseSensorData(data);
    const newStatus = determineDeviceStatus(newSensors);
    const formattedLastData = formatIndonesianDate(data.timestamp);

    const updatedDevice = {
      ...device,
      sensors: newSensors,
      status: newStatus,
      lastData: formattedLastData,
      online: true,
    };

    return {
      ...prevDevices,
      [deviceId]: updatedDevice,
    };
  });

  setLastUpdate(formatIndonesianDate(data.timestamp));
};

export const formatIndonesianTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const determineDeviceStatus = (sensors: Sensor[]): string => {
  if (sensors.length === 0) return 'Tidak Ada Data';

  const badSensors = sensors.filter((s) => s.status === 'BAD').length;
  const goodSensors = sensors.filter((s) => s.status === 'GOOD').length;

  if (badSensors > 0) return 'Bermasalah';
  if (goodSensors > 0) return 'Normal';
  return 'Tidak Ada Data';
};
