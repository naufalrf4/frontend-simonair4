export const TDS_STANDARDS = [
  { value: 342, label: '342 ppm (NaCl 0.02%)' },
  { value: 500, label: '500 ppm' },
  { value: 1000, label: '1000 ppm' },
];

export const calculateCompensationCoeff = (temp: number) => {
  return 1.0 + 0.02 * (temp - 25.0);
};

export const calculateTDSAlgorithm = (voltage: number, temperature: number, standard?: number) => {
  const compensationCoeff = calculateCompensationCoeff(temperature);
  const compensationVoltage = voltage / compensationCoeff;

  const tdsRaw =
    (133.42 * Math.pow(compensationVoltage, 3) -
      255.86 * Math.pow(compensationVoltage, 2) +
      857.39 * compensationVoltage) *
    0.5;

  let kValue = 1.0;
  if (standard && tdsRaw > 0) {
    kValue = standard / tdsRaw;
  }

  return {
    compensationCoeff,
    compensationVoltage,
    tdsRaw: Math.max(0, tdsRaw),
    kValue,
    tdsCalibrated: Math.max(0, Math.min(1000, tdsRaw * kValue)),
  };
};

export const getFinalStandard = (standardTDS: string, customStandard: string) => {
  if (standardTDS === 'custom') {
    return parseFloat(customStandard) || 0;
  }
  return parseFloat(standardTDS) || 0;
};
