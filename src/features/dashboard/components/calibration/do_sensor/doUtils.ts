export const DO_TABLE = [
  14460, 14220, 13820, 13440, 13090, 12740, 12420, 12110, 11810, 11530, 11260, 11010, 10770, 10530,
  10300, 10080, 9860, 9660, 9460, 9270, 9080, 8900, 8730, 8570, 8410, 8250, 8110, 7960, 7820, 7690,
  7560, 7430, 7300, 7180, 7070, 6950, 6840, 6730, 6630, 6530, 6410,
];

export const calculateSaturatedDO = (temp: number) => {
  const a = 14.652;
  const b = -0.41022;
  const c = 0.007991;
  const d = -0.000077774;

  return a + b * temp + c * Math.pow(temp, 2) + d * Math.pow(temp, 3);
};

export const getSaturationFromTable = (temp: number) => {
  const idx = Math.max(0, Math.min(40, Math.floor(temp)));
  return DO_TABLE[idx];
};

export const calculateUncalibratedDO = (voltage_mV: number) => {
  return (voltage_mV * 6.5) / 1000.0;
};

export const calculateCalibratedDO = (
  voltage_mV: number,
  temp: number,
  mode: 'single' | 'double',
  point1?: { voltage: number; temp: number } | null,
  point2?: { voltage: number; temp: number } | null,
) => {
  const sat = getSaturationFromTable(temp);
  let vSat = 0;

  if (mode === 'double' && point1 && point2 && point1.temp !== point2.temp) {
    vSat =
      point1.voltage +
      ((temp - point1.temp) * (point2.voltage - point1.voltage)) / (point2.temp - point1.temp);
  } else if (mode === 'single' && point1) {
    vSat = point1.voltage;
  } else {
    vSat = voltage_mV / 1000; 
  }

  if (vSat <= 0) return 0;

  const mgL = (voltage_mV * sat) / (vSat * 1000);
  return Math.max(0, Math.min(20, mgL));
};

export const canCalibrate = (currentVoltage: number, currentTemp: number, isConnected: boolean) => {
  return currentVoltage > 0 && currentTemp > 0 && isConnected;
};
