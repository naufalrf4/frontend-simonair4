import { toast } from "sonner";

export const PH_BUFFERS = [
  { value: '4.01', label: 'Buffer pH 4.01' },
  { value: '6.86', label: 'Buffer pH 6.86' },
  { value: '9.18', label: 'Buffer pH 9.18' },
  { value: 'custom', label: 'Nilai Custom' },
];

export const calculateRegression = (points: Array<{ pH: number; voltage: number }>) => {
  if (points.length < 2) return null;

  const n = points.length;
  const sumV = points.reduce((sum, p) => sum + p.voltage, 0);
  const sumP = points.reduce((sum, p) => sum + p.pH, 0);
  const sumVP = points.reduce((sum, p) => sum + p.voltage * p.pH, 0);
  const sumVV = points.reduce((sum, p) => sum + p.voltage * p.voltage, 0);

  const m = (n * sumVP - sumV * sumP) / (n * sumVV - sumV * sumV);
  const c = (sumP - m * sumV) / n;

  return { m, c };
};

export const calculateRSquared = (
  points: Array<{ pH: number; voltage: number }>,
  m: number,
  c: number,
) => {
  if (points.length < 2) return 0;

  const meanPH = points.reduce((sum, p) => sum + p.pH, 0) / points.length;
  const totalSumSquares = points.reduce((sum, p) => sum + Math.pow(p.pH - meanPH, 2), 0);
  const residualSumSquares = points.reduce((sum, p) => {
    const predicted = m * p.voltage + c;
    return sum + Math.pow(p.pH - predicted, 2);
  }, 0);

  return 1 - residualSumSquares / totalSumSquares;
};

export const addPoint = (
  bufferPoints: Array<{ pH: number; voltage: number }>,
  selectedBuffer: string,
  customPH: string,
  currentVoltage: number,
) => {
  if (!selectedBuffer || !currentVoltage) return null;

  const pHValue = selectedBuffer === 'custom' ? parseFloat(customPH) : parseFloat(selectedBuffer);

  if (isNaN(pHValue)) return null;

  const isDuplicate = bufferPoints.some((point) => Math.abs(point.pH - pHValue) < 0.01);
  if (isDuplicate) {
    toast.warning('Nilai pH ini sudah ada dalam titik kalibrasi');
    return null;
  }

  const newPoint = { pH: pHValue, voltage: currentVoltage };
  return [...bufferPoints, newPoint].sort((a, b) => a.pH - b.pH);
};

export const removePoint = (
  bufferPoints: Array<{ pH: number; voltage: number }>,
  index: number,
) => {
  return bufferPoints.filter((_, i) => i !== index);
};

export const canAddPoint = (
  selectedBuffer: string,
  currentVoltage: number,
  isConnected: boolean,
  customPH: string,
) => {
  return Boolean(
    selectedBuffer &&
    currentVoltage &&
    isConnected &&
    (selectedBuffer !== 'custom' || (customPH && !isNaN(parseFloat(customPH))))
  );
};