import { useState, useEffect, useMemo } from 'react';
import type { Device } from '../types';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from './dashboard/DashboardHeader';
import SystemStatusBar from './status/SystemStatusBar';
import DeviceList from './devices/DeviceList';
import NoDevicesFallback from './devices/NoDevicesFallback';
import CalibrationModal from './calibration/CalibrationModal';
import OffsetModal from './calibration/OffsetModal';
import { useDevices } from '../hooks/useDevices';
import { determineDeviceStatus, parseSensorData, updateDeviceData } from './utils/dashboardUtils';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { apiClient } from '@/utils/apiClient';
import { getBrowserFingerprint, decryptToken } from '@/utils/fingerprint';
import type { UserRole } from '@/features/users/types';

interface CalibrationModalState {
  open: boolean;
  deviceId: string;
  sensorType: '' | 'ph' | 'tds' | 'do';
}

interface OffsetModalState {
  open: boolean;
  deviceId: string;
}

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const [decryptedToken, setDecryptedToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [calibrationModal, setCalibrationModal] = useState<CalibrationModalState>({
    open: false,
    deviceId: '',
    sensorType: '',
  });
  const [offsetModal, setOffsetModal] = useState<OffsetModalState>({
    open: false,
    deviceId: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step 1: Get devices and sensor data via HTTP
  const { devices: initialDevices, loading: devicesLoading } = useDevices();

  useEffect(() => {
    if (tokenReady) return;

    const getToken = async () => {
      try {
        const encrypted = localStorage.getItem('simonairToken');
        if (!encrypted) {
          console.log('🔑 No token found in storage');
          setTokenReady(true);
          return;
        }

        const fingerprint = await getBrowserFingerprint();
        const decrypted = await decryptToken(encrypted, fingerprint);
        console.log('🔑 Token decrypted successfully');
        setDecryptedToken(decrypted);
      } catch (error) {
        console.error('🔑 Failed to decrypt token:', error);
      } finally {
        setTokenReady(true);
      }
    };

    getToken();
  }, []);

  // Step 3: Process initial devices and sensor data
  useEffect(() => {
    if (initialDevices && initialDevices.length > 0 && !hasInitialData) {
      console.log('📱 Step 3: Processing initial devices with sensor data');

      const devicesMap = initialDevices.reduce((acc, device) => {
        const deviceData: Device = {
          id: device.id,
          device_id: device.device_id,
          device_name: device.device_name,
          nama: device.device_name,
          status: 'Menunggu Data',
          fish_count: device.fish_count || 0,
          location: device.location || 'Tidak Diketahui',
          aquarium_size: device.aquarium_size || 'Tidak Diketahui',
          glass_type: device.glass_type || 'Tidak Diketahui',
          online: device.online,
          lastOnline: device.last_seen
            ? new Date(device.last_seen).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short',
              })
            : '-',
          lastData: '',
          sensors: [],
        };

        if (device.latestSensorData) {
          const sensorData = device.latestSensorData;
          deviceData.sensors = parseSensorData(sensorData);
          deviceData.status = determineDeviceStatus(deviceData.sensors);
          deviceData.lastData = new Date(sensorData.timestamp).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          });

          if (!lastUpdate) {
            setLastUpdate(
              new Date(sensorData.timestamp).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short',
              }),
            );
          }
        }

        acc[device.device_id] = deviceData;
        return acc;
      }, {} as Record<string, Device>);

      setDevices(devicesMap);
      setHasInitialData(true);
      console.log('📱 Step 3: Initial devices processed, hasInitialData set to true');
    }
  }, [initialDevices, hasInitialData]);

  // Step 4: Enable WebSocket when both conditions are met
  useEffect(() => {
    if (hasInitialData && tokenReady && decryptedToken && !isWebSocketReady) {
      console.log('🔌 Step 4: All prerequisites met, enabling WebSocket in 1 second...');
      const timer = setTimeout(() => {
        setIsWebSocketReady(true);
        console.log('🔌 Step 4: WebSocket ready flag set to true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasInitialData, tokenReady, decryptedToken, isWebSocketReady]);

  // Step 5: Connect WebSocket with stable dependencies
  const webSocketEnabled = isWebSocketReady && 
                           tokenReady && 
                           !devicesLoading && 
                           !!decryptedToken && 
                           hasInitialData && 
                           (initialDevices?.length ?? 0) > 0;

  console.log('🔌 WebSocket conditions:', {
    isWebSocketReady,
    tokenReady,
    devicesLoading,
    hasToken: !!decryptedToken,
    hasInitialData,
    deviceCount: initialDevices?.length ?? 0,
    enabled: webSocketEnabled
  });

  const { isConnected, sensorData, calibrationAck, thresholdAck } = useWebSocket({
    token: decryptedToken,
    devices: initialDevices || [],
    role: user?.role as UserRole | undefined,
    enabled: webSocketEnabled,
  });

  // Step 6: Handle real-time WebSocket updates
  useEffect(() => {
    if (sensorData && hasInitialData && isConnected) {
      console.log('🔄 Step 6: Processing WebSocket real-time updates');
      Object.values(sensorData).forEach((data) => {
        updateDeviceData(
          data.device_id,
          data,
          setDevices,
          setLastUpdate,
          parseSensorData,
          determineDeviceStatus,
        );
      });
    }
  }, [sensorData, hasInitialData, isConnected]);

  useEffect(() => {
    if (calibrationAck) {
      toast.success(`Calibration: ${calibrationAck.message}`);
    }
    if (thresholdAck) {
      toast.success(`Threshold: ${thresholdAck.message}`);
    }
  }, [calibrationAck, thresholdAck]);

  const handleCalibrateClick = (deviceId: string) => {
    setCalibrationModal({ open: true, deviceId, sensorType: '' });
  };

  const handleOffsetClick = (deviceId: string) => {
    setOffsetModal({ open: true, deviceId });
  };

  const handleModalClose = () => {
    setCalibrationModal({ open: false, deviceId: '', sensorType: '' });
  };

  const handleOffsetModalClose = () => {
    setOffsetModal({ open: false, deviceId: '' });
  };

  const handleSensorSelect = (sensorType: '' | 'ph' | 'tds' | 'do') => {
    setCalibrationModal((prev) => ({ ...prev, sensorType }));
  };

  const handleCalibrationSubmit = async (calibrationData: any) => {
    try {
      await apiClient.post(`/devices/${calibrationModal.deviceId}/calibrations`, calibrationData);
      toast.success('Calibration submitted successfully');
    } catch (error) {
      console.error('Failed to submit calibration:', error);
      toast.error('Failed to submit calibration');
      throw error;
    }
  };

  const handleOffsetSubmit = async (thresholds: any) => {
    try {
      await apiClient.post(`/devices/${offsetModal.deviceId}/thresholds`, {
        threshold: thresholds,
      });
      toast.success('Offset submitted successfully');
    } catch (error) {
      console.error('Failed to submit offset:', error);
      toast.error('Failed to submit offset');
      throw error;
    }
  };

  const deviceList = useMemo(() => Object.values(devices), [devices]);
  const onlineDevices = useMemo(
    () => deviceList.filter((device) => device.online).length,
    [deviceList],
  );
  const totalDevices = deviceList.length;

  // Show loading until we have initial data
  if (!user || devicesLoading || !tokenReady || !hasInitialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!user ? 'Authenticating...' : 
             devicesLoading ? 'Loading devices...' :
             !tokenReady ? 'Preparing connection...' :
             'Loading sensor data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <DashboardHeader />

        <SystemStatusBar
          isConnected={isConnected}
          onlineDevices={onlineDevices}
          totalDevices={totalDevices}
          lastUpdate={lastUpdate}
        />

        <Separator className="my-8 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

        <div className="space-y-8">
          {deviceList.length === 0 ? (
            <NoDevicesFallback isConnected={isConnected} />
          ) : (
            <DeviceList
              devices={deviceList}
              onCalibrateClick={handleCalibrateClick}
              onOffsetClick={handleOffsetClick}
            />
          )}
        </div>

        {hasInitialData && !isWebSocketReady && (
          <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-pulse rounded-full h-4 w-4 bg-blue-600"></div>
              <span className="text-sm text-blue-800">Mempersiapkan koneksi real-time...</span>
            </div>
          </div>
        )}

        {isWebSocketReady && !isConnected && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm text-yellow-800">Menghubungkan ke data real-time...</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="rounded-full h-4 w-4 bg-green-600"></div>
              <span className="text-sm text-green-800">Data real-time aktif</span>
            </div>
          </div>
        )}
      </div>

      <CalibrationModal
        open={calibrationModal.open}
        deviceId={calibrationModal.deviceId}
        sensorType={calibrationModal.sensorType}
        onClose={handleModalClose}
        onSensorSelect={handleSensorSelect}
        onSubmit={handleCalibrationSubmit}
        currentDeviceData={devices[calibrationModal.deviceId]}
      />

      <OffsetModal
        open={offsetModal.open}
        deviceId={offsetModal.deviceId}
        onClose={handleOffsetModalClose}
        onSubmit={handleOffsetSubmit}
        currentDeviceData={devices[offsetModal.deviceId]}
      />
    </div>
  );
};

export default UserDashboard;