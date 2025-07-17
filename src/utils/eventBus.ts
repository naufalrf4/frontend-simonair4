import { useEffect } from 'react';
import type { User } from '@/features/users/types';

export interface AuthEventMap {
  'token-refreshed': { token: string };
  'auth-error': {
    error: any;
    type: 'refresh_failed' | 'network_error' | 'invalid_token' | 'fetch_failed' | 'unauthorized';
  };
  'logout-required': {};
  'token-expired': {};
  'user-logged-out': {};
  'profile-fetch-required': {};
  'profile-updated': { user: User };
  'refresh-scheduled': { refreshIn: number };
  'refresh-attempt': { attempt: number };
}

type EventListener<T> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventListener<any>>> = new Map();
  private isDestroyed = false;

  emit<K extends keyof AuthEventMap>(event: K, data: AuthEventMap[K]): void {
    if (this.isDestroyed) return;

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const listenersArray = Array.from(eventListeners);
      listenersArray.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    if (process.env.NODE_ENV === 'development') {
      if (event === 'token-refreshed') {
        console.log(`🔄 [EventBus] Token refreshed successfully`);
      } else if (event === 'auth-error') {
        console.error(`🚨 [EventBus] Auth error:`, data);
      } else if (event === 'token-expired') {
        console.warn(`⏰ [EventBus] Token expired`);
      } else {
        console.log(`[EventBus] ${event}:`, data);
      }
    }
  }

  on<K extends keyof AuthEventMap>(event: K, listener: EventListener<AuthEventMap[K]>): () => void {
    if (this.isDestroyed) return () => {};

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(listener);

    return () => {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  once<K extends keyof AuthEventMap>(
    event: K,
    listener: EventListener<AuthEventMap[K]>,
  ): () => void {
    const cleanup = this.on(event, (data) => {
      listener(data);
      cleanup();
    });
    return cleanup;
  }

  getListenerCount(event: keyof AuthEventMap): number {
    return this.listeners.get(event)?.size || 0;
  }

  destroy(): void {
    this.listeners.clear();
    this.isDestroyed = true;
  }
}

export const eventBus = new EventBus();

export function useEventListener<K extends keyof AuthEventMap>(
  event: K,
  listener: EventListener<AuthEventMap[K]>,
  dependencies: any[] = [],
): void {
  useEffect(() => {
    const cleanup = eventBus.on(event, listener);
    return cleanup;
  }, dependencies);
}
