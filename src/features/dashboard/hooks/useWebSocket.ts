import type { UserRole } from '@/features/users/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketProps {
  token: string | null;
  devices: Array<{ device_id: string; id?: string }>;
  role?: UserRole;
  enabled?: boolean;
}

interface SensorUpdateData {
  device_id: string;
  timestamp: string;
  temperature?: {
    value: number;
    status: 'GOOD' | 'BAD';
    raw?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
  };
  ph?: {
    raw: number;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
    status: 'GOOD' | 'BAD';
  };
  tds?: {
    raw: number;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
    status: 'GOOD' | 'BAD';
  };
  do_level?: {
    raw: number;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
    status: 'GOOD' | 'BAD';
  };
  [key: string]: any;
}

interface AckData {
  device_id: string;
  ack_status: 'success' | 'failed';
  message: string;
  timestamp?: string;
}

export const useWebSocket = ({ token, devices, role, enabled = true }: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<Record<string, SensorUpdateData>>({});
  const [calibrationAck, setCalibrationAck] = useState<AckData | null>(null);
  const [thresholdAck, setThresholdAck] = useState<AckData | null>(null);
  
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const connectedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    connectedRef.current = false;
    isConnectingRef.current = false;
    clearTimeouts();
    
    if (socket) {
      // console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    
    reconnectAttemptsRef.current = 0;
  }, [socket, clearTimeouts]);

  const connect = useCallback(() => {
    if (!enabledRef.current) {
      // console.log('🔌 WebSocket disabled, skipping connection');
      return;
    }

    if (!token || !import.meta.env.VITE_BASE_URL) {
      // console.log('🔌 Missing token or base URL:', { hasToken: !!token, hasUrl: !!import.meta.env.VITE_BASE_URL });
      return;
    }

    if (devices.length === 0) {
      // console.log('🔌 No devices available for WebSocket');
      return;
    }

    if (isConnectingRef.current || connectedRef.current) {
      // console.log('🔌 Already connecting/connected, skipping');
      return;
    }

    if (socket) {
      disconnect();
    }

    isConnectingRef.current = true;
    clearTimeouts();

    // console.log('🔌 Connecting to WebSocket...', {
    //   url: import.meta.env.VITE_BASE_URL,
    //   deviceCount: devices.length,
    //   hasToken: !!token
    // });

    const socketInstance = io(import.meta.env.VITE_BASE_URL, {
      auth: { 
        token: token.startsWith('Bearer ') ? token.slice(7) : token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: false,
    });

    socketInstance.on('connect', () => {
      // console.log('✅ WebSocket connected:', socketInstance.id);
      setIsConnected(true);
      connectedRef.current = true;
      isConnectingRef.current = false;
      reconnectAttemptsRef.current = 0;

      devices.forEach((device) => {
        const roomName = `device:${device.device_id}`;
        socketInstance.emit('join_room', roomName);
        // console.log(`📡 Joining room: ${roomName}`);
      });

      if (role === 'admin' || role === 'superuser') {
        socketInstance.emit('join_room', 'all-devices');
        // console.log('📡 Joining admin room: all-devices');
      }
    });

    socketInstance.on('disconnect', (reason) => {
      // console.warn('⚠️ WebSocket disconnected:', reason);
      setIsConnected(false);
      connectedRef.current = false;
      isConnectingRef.current = false;
      
      if (reason === 'io server disconnect') {
        // console.error('❌ Server disconnected client - likely auth failure');
        return;
      }
      
      if (reason !== 'io client disconnect' && 
          reconnectAttemptsRef.current < maxReconnectAttempts && 
          enabledRef.current) {
        
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        // console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, delay);
      } else {
        // console.error('❌ Max reconnection attempts reached or connection disabled');
      }
    });

    socketInstance.on('connect_error', (error) => {
      // console.error('❌ WebSocket connection error:', error.message);
      setIsConnected(false);
      connectedRef.current = false;
      isConnectingRef.current = false;
      
      if (error.message.includes('Authentication') || error.message.includes('jwt')) {
        // console.error('❌ Authentication error - stopping reconnection attempts');
        return;
      }

      if (reconnectAttemptsRef.current < maxReconnectAttempts && enabledRef.current) {
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
        // console.log(`🔄 Retrying connection in ${delay}ms due to error: ${error.message}`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, delay);
      }
    });

    socketInstance.on('sensorUpdate', (data: SensorUpdateData) => {
      // console.log(`📡 Received sensor update for device: ${data.device_id}`, data);
      setSensorData((prevData) => ({
        ...prevData,
        [data.device_id]: {
          ...data,
          timestamp: data.timestamp || new Date().toISOString(),
        },
      }));
    });

    socketInstance.on('realtimeSensorUpdate', (data: any) => {
      const device_id = data.device_id || data.deviceId;
      const timestamp = data.timestamp || data.time || new Date().toISOString();
      setSensorData((prev) => ({
        ...prev,
        [device_id]: {
          ...data,
          device_id,
          timestamp,
        } as any,
      }));
    });

    socketInstance.on('calibrationAck', (data: AckData) => {
      setCalibrationAck(data);
      setTimeout(() => setCalibrationAck(null), 5000);
    });

    socketInstance.on('thresholdAck', (data: AckData) => {
      setThresholdAck(data);
      setTimeout(() => setThresholdAck(null), 5000);
    });

    socketInstance.on('error', (error) => {
      // console.error('❌ WebSocket error:', error);
    });

    setSocket(socketInstance);
  }, [token, devices, role, socket, disconnect, clearTimeouts]);

  useEffect(() => {
    if (enabled && token && devices.length > 0) {
      // console.log('🔌 WebSocket prerequisites met, attempting connection...');
      
      const timer = setTimeout(() => {
        connect();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // console.log('🔌 WebSocket prerequisites not met:', {
      //   enabled,
      //   hasToken: !!token,
      //   deviceCount: devices.length
      // });
      disconnect();
    }
  }, [enabled, token, devices.length, connect, disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    
    setTimeout(() => {
      connect();
    }, 500);
  }, [disconnect, connect]);

  const joinRoom = useCallback((roomName: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomName);
      // console.log(`📡 Manually joining room: ${roomName}`);
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomName: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomName);
      // console.log(`📡 Leaving room: ${roomName}`);
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    sensorData,
    calibrationAck,
    thresholdAck,
    reconnect,
    joinRoom,
    leaveRoom,
  };
};
