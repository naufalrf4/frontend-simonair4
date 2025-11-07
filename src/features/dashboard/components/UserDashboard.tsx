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
import {
  determineDeviceStatus,
  parseSensorData,
  updateDeviceData,
  ONLINE_THRESHOLD_MS,
  formatIndonesianDate,
} from './utils/dashboardUtils';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useWebSocket, type SensorUpdateData } from '../hooks/useWebSocket';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { apiClient } from '@/utils/apiClient';
import type { UserRole } from '@/features/users/types';
import { useTranslation } from 'react-i18next';

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
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const [calibrationModal, setCalibrationModal] = useState<CalibrationModalState>({
    open: false,
    deviceId: '',
    sensorType: '',
  });
  const [offsetModal, setOffsetModal] = useState<OffsetModalState>({
    open: false,
    deviceId: '',
  });
  // const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step 1: Get devices and sensor data via HTTP
  const { devices: initialDevices, loading: devicesLoading } = useDevices();
  const initialSnapshots = useMemo(() => {
    if (!initialDevices || initialDevices.length === 0) return {};
    return initialDevices.reduce((acc, device) => {
      const latest = device.latestSensorData as Partial<SensorUpdateData> | undefined;
      if (!latest) return acc;
      const timestamp =
        latest.timestamp ||
        latest.time ||
        new Date().toISOString();
      const snapshot: SensorUpdateData = {
        ...latest,
        device_id: device.device_id,
        timestamp,
        time: latest.time || timestamp,
        realtime: latest.realtime ?? false,
        source: latest.source ?? 'database',
      };
      acc[device.device_id] = snapshot;
      return acc;
    }, {} as Record<string, SensorUpdateData>);
  }, [initialDevices]);

  // Step 3: Process initial devices and sensor data
  useEffect(() => {
    if (initialDevices && initialDevices.length > 0 && !hasInitialData) {
      // console.log('📱 Step 3: Processing initial devices with sensor data');

      const devicesMap = initialDevices.reduce((acc, device) => {
        const lastSeenIso = device.lastSeenIso || device.last_seen || null;
        const baseOnline = lastSeenIso
          ? Date.now() - new Date(lastSeenIso).getTime() < ONLINE_THRESHOLD_MS
          : false;
        const formattedLastOnline = lastSeenIso
          ? formatIndonesianDate(lastSeenIso)
          : '-';

        const deviceData: Device = {
          id: device.id,
          device_id: device.device_id,
          device_name: device.device_name,
          nama: device.device_name,
          status: 'waiting',
          fish_count: device.fish_count || 0,
          location: device.location || '',
          aquarium_size: device.aquarium_size || '',
          glass_type: device.glass_type || '',
          online: baseOnline,
          lastSeenIso,
          lastOnline: formattedLastOnline,
          lastData: '',
          sensors: [],
        };

        if (device.latestSensorData) {
          const sensorData = device.latestSensorData;
          deviceData.sensors = parseSensorData(sensorData);
          deviceData.status = determineDeviceStatus(deviceData.sensors);
          const sensorIso = sensorData.timestamp || sensorData.time;
          if (sensorIso) {
            const normalized = new Date(sensorIso).toISOString();
            deviceData.lastData = formatIndonesianDate(normalized);
            deviceData.lastSeenIso = normalized;
            deviceData.lastOnline = formatIndonesianDate(normalized);
            deviceData.online =
              Date.now() - new Date(normalized).getTime() < ONLINE_THRESHOLD_MS;
          }

          if (!lastUpdate && deviceData.lastSeenIso) {
            setLastUpdate(formatIndonesianDate(deviceData.lastSeenIso));
          }
        }

        acc[device.device_id] = deviceData;
        return acc;
      }, {} as Record<string, Device>);

      setDevices(devicesMap);
      setHasInitialData(true);
      // console.log('📱 Step 3: Initial devices processed, hasInitialData set to true');
    }
  }, [initialDevices, hasInitialData]);

  // Step 4: Enable WebSocket when both conditions are met
  useEffect(() => {
    if (hasInitialData && accessToken && !isWebSocketReady) {
      // console.log('🔌 Step 4: All prerequisites met, enabling WebSocket in 1 second...');
      const timer = setTimeout(() => {
        setIsWebSocketReady(true);
        // console.log('🔌 Step 4: WebSocket ready flag set to true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasInitialData, accessToken, isWebSocketReady]);

  // Step 5: Connect WebSocket with stable dependencies
  const webSocketEnabled = isWebSocketReady && 
                           !devicesLoading && 
                           !!accessToken && 
                           hasInitialData && 
                           (initialDevices?.length ?? 0) > 0;

  // console.log('🔌 WebSocket conditions:', {
  //   isWebSocketReady,
  //   devicesLoading,
  //   hasToken: !!accessToken,
  //   hasInitialData,
  //   deviceCount: initialDevices?.length ?? 0,
  //   enabled: webSocketEnabled
  // });

  const { isConnected, sensorData, calibrationAck, thresholdAck } = useWebSocket({
    token: accessToken,
    devices: initialDevices || [],
    role: user?.role as UserRole | undefined,
    enabled: webSocketEnabled,
    initialSnapshots,
  });

  // Step 6: Handle real-time WebSocket updates
  useEffect(() => {
    if (sensorData && hasInitialData && isConnected) {
      // console.log('🔄 Step 6: Processing WebSocket real-time updates');
      Object.values(sensorData).forEach((data) => {
        updateDeviceData(
          data.device_id,
          data,
          setDevices,
          setLastUpdate,
          parseSensorData,
          determineDeviceStatus,
          ONLINE_THRESHOLD_MS,
        );
      });
    }
  }, [sensorData, hasInitialData, isConnected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        let mutated = false;
        const next: Record<string, Device> = { ...prev };

        Object.entries(prev).forEach(([deviceId, device]) => {
          const iso = device.lastSeenIso;
          const isOnline = iso
            ? now - new Date(iso).getTime() < ONLINE_THRESHOLD_MS
            : false;
          if (device.online !== isOnline) {
            mutated = true;
            next[deviceId] = { ...device, online: isOnline };
          }
        });

        return mutated ? next : prev;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (calibrationAck) {
      const fn =
        calibrationAck.ack_status === 'success' ? toast.success : toast.error;
      fn(`Calibration: ${calibrationAck.message}`);
    }
    if (thresholdAck) {
      const fn =
        thresholdAck.ack_status === 'success' ? toast.success : toast.error;
      fn(`Threshold: ${thresholdAck.message}`);
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
      // console.log('Submitting calibration data:', calibrationData);
      await apiClient.post(`/devices/${calibrationModal.deviceId}/calibrations`, calibrationData);
      toast.success(t('toasts.calibrationSuccess'));
    } catch (error) {
      // console.error('Failed to submit calibration:', error);
      toast.error(t('toasts.calibrationError'));
      throw error;
    }
  };

  const handleOffsetSubmit = async (thresholds: any) => {
    try {
      await apiClient.post(`/devices/${offsetModal.deviceId}/thresholds`, thresholds);
      toast.success(t('toasts.offsetSuccess'));
    } catch (error) {
      // console.error('Failed to submit offset:', error);
      toast.error(t('toasts.offsetError'));
      throw error;
    }
  };

  const deviceList = useMemo(() => Object.values(devices), [devices]);
  const onlineDevices = useMemo(
    () => deviceList.filter((device) => device.online).length,
    [deviceList],
  );
  const totalDevices = deviceList.length;

  // Show loading until we have initial data for existing devices.
  // If there are no devices, show the dashboard with the empty state immediately.
  const hasDevices = (initialDevices?.length ?? 0) > 0;
  const isLoading = authLoading || !user || devicesLoading || (hasDevices ? (!accessToken || !hasInitialData) : false);

  if (isLoading) {
    return (
      <div className="min-h-screen from-blue-50/30 via-white to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!user ? t('loading.auth') :
             devicesLoading ? t('loading.devices') :
             hasDevices && !accessToken ? t('loading.preparing') :
             hasDevices && !hasInitialData ? t('loading.sensors') :
             t('loading.generic')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50/30 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-8">
        <DashboardHeader />

        <SystemStatusBar
          isConnected={isConnected}
          onlineDevices={onlineDevices}
          totalDevices={totalDevices}
          lastUpdate={lastUpdate}
        />

        <Separator className="my-8 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />


        <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-0">
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
              <span className="text-sm text-blue-800">{t('banners.initializing')}</span>
            </div>
          </div>
        )}

        {isWebSocketReady && !isConnected && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm text-yellow-800">{t('banners.connecting')}</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="fixed bottom-4 right-4 bg-green-100 border green-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="rounded-full h-4 w-4 bg-green-600"></div>
              <span className="text-sm text-green-800">{t('banners.active')}</span>
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
