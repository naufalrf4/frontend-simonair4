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

export interface Device {
  id: string;
  device_id: string;
  device_name: string;
  nama: string;
  status: string;
  location?: string;
  aquarium_size?: string;
  glass_type?: string;
  fish_count?: number;
  online: boolean;
  lastSeenIso?: string | null;
  lastOnline: string;
  lastData: string;
  sensors: Sensor[];
}
