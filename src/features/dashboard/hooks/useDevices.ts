import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';

interface SensorData {
  time: string;
  timestamp: string;
  temperature?: {
    value?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
    status?: 'GOOD' | 'BAD';
  };
  ph?: {
    value?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
    status?: 'GOOD' | 'BAD';
  };
  tds?: {
    value?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
    status?: 'GOOD' | 'BAD';
  };
  do_level?: {
    value?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
    status?: 'GOOD' | 'BAD';
  };
}

interface Device {
  id: string;
  device_id: string;
  device_name: string;
  location?: string;
  aquarium_size?: string;
  glass_type?: string;
  fish_count?: number;
  last_seen: string;
  lastSeenIso?: string | null;
  is_active: boolean;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
  online: boolean;
  latestSensorData?: SensorData;
}

interface UseDevicesReturn {
  devices: Device[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const computeOnlineStatus = (lastSeen: string): boolean => {
    if (!lastSeen) return false;
    const lastSeenTime = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    return now - lastSeenTime < 5 * 60 * 1000;
  };

  const fetchDevices = async (retries = 3): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/devices');

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure');
      }

      const enrichedDevices = response.data.data.map((device: any) => {
        const lastSeenIso = device.last_seen ?? null;
        const computedOnline = lastSeenIso ? computeOnlineStatus(lastSeenIso) : false;
        const isOnline =
          typeof device.online === 'boolean' ? device.online : computedOnline;

        return {
          id: device.id,
          device_id: device.device_id,
          device_name: device.device_name,
          location: device.location,
          aquarium_size: device.aquarium_size,
          glass_type: device.glass_type,
          fish_count: device.fish_count,
          last_seen: device.last_seen,
          is_active: device.is_active,
          created_at: device.created_at,
          user: device.user,
          online: isOnline,
          lastSeenIso,
          latestSensorData: device.latestSensorData,
        };
      });

      setDevices(enrichedDevices);
      console.log(`📱 Loaded ${enrichedDevices.length} devices with sensor data`);
    } catch (err) {
      const error = err as any;
      console.error('Failed to fetch devices:', error);
      
      if (retries > 0 && error.response?.status !== 401) {
        console.warn(`Retrying fetchDevices (${retries} attempts left)...`);
        setTimeout(() => fetchDevices(retries - 1), 2000);
      } else {
        setError(error);
        
        if (error.response?.status === 401) {
          console.error('Unauthorized - Token may need refresh');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchDevices();
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          online: computeOnlineStatus(device.lastSeenIso ?? device.last_seen),
          lastSeenIso: device.lastSeenIso ?? device.last_seen
        }))
      );
    }, 30000); 

    return () => clearInterval(interval);
  }, []);

  return { devices, loading, error, refetch };
};
