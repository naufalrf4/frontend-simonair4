export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 10) return 'Good Morning';
  if (hour < 15) return 'Good Afternoon';
  if (hour < 18) return 'Good Evening';
  return 'Good Night';
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
  if (payload.ph !== undefined && payload.ph !== null) {
    const isNumber = typeof payload.ph === 'number';
    sensors.push({
      label: 'pH',
      value: isNumber
        ? (payload.ph as number).toFixed(2)
        : typeof payload.ph.calibrated === 'number'
          ? payload.ph.calibrated.toFixed(2)
          : typeof payload.ph.raw === 'number'
            ? payload.ph.raw.toFixed(2)
            : '-',
      unit: '',
      status: isNumber ? 'GOOD' : payload.ph.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: isNumber ? undefined : payload.ph.raw,
      voltage: isNumber ? undefined : payload.ph.voltage,
      calibrated: isNumber ? (payload.ph as number) : payload.ph.calibrated,
      calibrated_ok: isNumber ? undefined : payload.ph.calibrated_ok,
    });
  }

  // TDS Sensor
  if (payload.tds !== undefined && payload.tds !== null) {
    const isNumber = typeof payload.tds === 'number';
    sensors.push({
      label: 'TDS',
      value: isNumber
        ? (payload.tds as number).toFixed(1)
        : typeof payload.tds.calibrated === 'number'
          ? payload.tds.calibrated.toFixed(1)
          : typeof payload.tds.raw === 'number'
            ? payload.tds.raw.toFixed(1)
            : '-',
      unit: 'ppm',
      status: isNumber ? 'GOOD' : payload.tds.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: isNumber ? undefined : payload.tds.raw,
      voltage: isNumber ? undefined : payload.tds.voltage,
      calibrated: isNumber ? (payload.tds as number) : payload.tds.calibrated,
      calibrated_ok: isNumber ? undefined : payload.tds.calibrated_ok,
    });
  }

  // DO Sensor
  if (payload.do_level !== undefined && payload.do_level !== null) {
    const isNumber = typeof payload.do_level === 'number';
    sensors.push({
      label: 'DO',
      value: isNumber
        ? (payload.do_level as number).toFixed(2)
        : typeof payload.do_level.calibrated === 'number'
          ? payload.do_level.calibrated.toFixed(2)
          : typeof payload.do_level.raw === 'number'
            ? payload.do_level.raw.toFixed(2)
            : '-',
      unit: 'mg/L',
      status: isNumber ? 'GOOD' : payload.do_level.status === 'GOOD' ? 'GOOD' : 'BAD',
      raw: isNumber ? undefined : payload.do_level.raw,
      voltage: isNumber ? undefined : payload.do_level.voltage,
      calibrated: isNumber ? (payload.do_level as number) : payload.do_level.calibrated,
      calibrated_ok: isNumber ? undefined : payload.do_level.calibrated_ok,
    });
  }

  // Temperature Sensor
  if (payload.temperature !== undefined && payload.temperature !== null) {
    const isNumber = typeof payload.temperature === 'number';
    sensors.push({
      label: 'Suhu',
      value: isNumber
        ? (payload.temperature as number).toFixed(1)
        : typeof payload.temperature.value === 'number'
          ? payload.temperature.value.toFixed(1)
          : '-',
      unit: '°C',
      status: isNumber ? 'GOOD' : payload.temperature.status === 'GOOD' ? 'GOOD' : 'BAD',
    });
  }

  return sensors;
};

export const formatIndonesianDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
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
  // console.log(`🔄 Updating device ${deviceId} with real-time data`);
  
  const mergeSensors = (prevSensors: Sensor[], nextSensors: Sensor[]): Sensor[] => {
    if (!Array.isArray(nextSensors) || nextSensors.length === 0) return prevSensors || [];
    const map = new Map<string, Sensor>();
    (prevSensors || []).forEach((s) => {
      if (s && s.label) map.set(s.label, s);
    });
    nextSensors.forEach((s) => {
      if (s && s.label) map.set(s.label, s);
    });
    return Array.from(map.values());
  };

  setDevices((prevDevices: any) => {
    const device = prevDevices[deviceId];
    if (!device) {
      // console.warn(`Device ${deviceId} not found in state`);
      return prevDevices;
    }

    const nextSensors = parseSensorData(data);
    const mergedSensors = mergeSensors(device.sensors || [], nextSensors);
    const newStatus = determineDeviceStatus(mergedSensors);
    const formattedLastData = formatIndonesianDate(data.timestamp);

    const updatedDevice = {
      ...device,
      sensors: mergedSensors,
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
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const determineDeviceStatus = (sensors: Sensor[]): string => {
  if (sensors.length === 0) return 'No Data';

  const badSensors = sensors.filter((s) => s.status === 'BAD').length;
  const goodSensors = sensors.filter((s) => s.status === 'GOOD').length;
  
  if (badSensors > 0) return 'Problematic';
  if (goodSensors > 0) return 'Normal';
  return 'No Data';
};
