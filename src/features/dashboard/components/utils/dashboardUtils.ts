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
  const toNumber = (input: unknown): number | undefined => {
    if (input === null || input === undefined) return undefined;
    if (typeof input === 'number') {
      return Number.isFinite(input) ? input : undefined;
    }
    const parsed = parseFloat(String(input));
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const normalizeReading = (input: any) => {
    if (input === null || input === undefined) return null;

    if (typeof input === 'number') {
      const numeric = toNumber(input);
      return numeric !== undefined
        ? { value: numeric, status: 'GOOD' as const }
        : null;
    }

    if (typeof input === 'object') {
      const reading: {
        value?: number;
        voltage?: number;
        calibrated?: number;
        calibrated_ok?: boolean;
        status?: 'GOOD' | 'BAD';
      } = {};

      const value = toNumber((input as any).value);
      if (value !== undefined) reading.value = value;

      const calibrated = toNumber((input as any).calibrated);
      if (calibrated !== undefined) reading.calibrated = calibrated;

      const voltage = toNumber((input as any).voltage);
      if (voltage !== undefined) reading.voltage = voltage;

      if ((input as any).calibrated_ok !== undefined) {
        reading.calibrated_ok = Boolean((input as any).calibrated_ok);
      }

      if ((input as any).status) {
        const status = String((input as any).status).toUpperCase();
        if (status === 'GOOD' || status === 'BAD') {
          reading.status = status as 'GOOD' | 'BAD';
        }
      }

      return Object.keys(reading).length > 0 ? reading : null;
    }

    const numeric = toNumber(input);
    return numeric !== undefined
      ? { value: numeric, status: 'GOOD' as const }
      : null;
  };

  // pH Sensor
  if (payload.ph !== undefined && payload.ph !== null) {
    const reading = normalizeReading(payload.ph);
    if (reading) {
    sensors.push({
      label: 'pH',
      value:
        reading.calibrated ?? reading.value ?? '-',
      unit: '',
      status: reading.status ?? 'GOOD',
      voltage: reading.voltage,
      calibrated: reading.calibrated,
      calibrated_ok: reading.calibrated_ok,
    });
    }
  }

  // TDS Sensor
  if (payload.tds !== undefined && payload.tds !== null) {
    const reading = normalizeReading(payload.tds);
    if (reading) {
    sensors.push({
      label: 'TDS',
      value:
        reading.calibrated ?? reading.value ?? '-',
      unit: 'ppm',
      status: reading.status ?? 'GOOD',
      voltage: reading.voltage,
      calibrated: reading.calibrated,
      calibrated_ok: reading.calibrated_ok,
    });
    }
  }

  // DO Sensor
  if (payload.do_level !== undefined && payload.do_level !== null) {
    const reading = normalizeReading(payload.do_level);
    if (reading) {
    sensors.push({
      label: 'DO',
      value:
        reading.calibrated ?? reading.value ?? '-',
      unit: 'mg/L',
      status: reading.status ?? 'GOOD',
      voltage: reading.voltage,
      calibrated: reading.calibrated,
      calibrated_ok: reading.calibrated_ok,
    });
    }
  }

  // Temperature Sensor
  if (payload.temperature !== undefined && payload.temperature !== null) {
    const reading = normalizeReading(payload.temperature);
    if (reading) {
    sensors.push({
      label: 'Suhu',
      value: reading.value ?? reading.calibrated ?? '-',
      unit: '°C',
      status: reading.status ?? 'GOOD',
      voltage: reading.voltage,
      calibrated: reading.calibrated,
      calibrated_ok: reading.calibrated_ok,
    });
    }
  }

  return sensors;
};

export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

const normalizeIso = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
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
  onlineThresholdMs: number = ONLINE_THRESHOLD_MS,
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

    const resolvedIso =
      normalizeIso(data.timestamp) ||
      normalizeIso(data.time) ||
      device.lastSeenIso ||
      new Date().toISOString();

    const formattedLastData = formatIndonesianDate(resolvedIso);

    let lastOnline = device.lastOnline;
    if (resolvedIso) {
      lastOnline = formatIndonesianDate(resolvedIso);
    }

    let isOnline = device.online;
    if (resolvedIso) {
      const lastSeenTime = new Date(resolvedIso).getTime();
      if (!Number.isNaN(lastSeenTime)) {
        isOnline = Date.now() - lastSeenTime < onlineThresholdMs;
      }
    }

    const updatedDevice = {
      ...device,
      sensors: mergedSensors,
      status: newStatus,
      lastData: formattedLastData,
      lastOnline,
      lastSeenIso: resolvedIso,
      online: isOnline,
    };

    return {
      ...prevDevices,
      [deviceId]: updatedDevice,
    };
  });

  const latestIso =
    normalizeIso(data.timestamp) || normalizeIso(data.time) || new Date().toISOString();
  setLastUpdate(formatIndonesianDate(latestIso));
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
