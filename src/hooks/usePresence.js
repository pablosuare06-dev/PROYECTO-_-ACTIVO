import { useEffect, useCallback, useRef } from 'react';
import { api } from '@/api/apiClient';

/** @typedef {'online' | 'offline'} PresenceStatus */

/**
 * Hook que maneja presencia online/offline del usuario
 * - Registra el usuario como online al montar
 * - Envía heartbeat cada 2-3s
 * - Detecta page visibility changes
 * - Marca offline automáticamente después de timeout sin heartbeat (estrategia más confiable)
 * - Marks offline cuando se cierra la página o se pierde conexión
 * @param {string|null} userId - ID del usuario autenticado
 * @param {string} usuarioNombre - Nombre del usuario
 * @returns {{updatePresence: Function}}
 */
export function usePresence(userId, usuarioNombre) {
  const DEVICE_TYPE = /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';

  // En móvil/tablet, usar heartbeat más frecuente (2s) para detectar cambios más rápido
  const HEARTBEAT_INTERVAL = DEVICE_TYPE === 'mobile' ? 2000 : 3000;

  // Timeout para marcar offline automáticamente si no hay heartbeat
  // Estrategia más confiable que beforeunload
  const OFFLINE_TIMEOUT = DEVICE_TYPE === 'mobile' ? 8000 : 10000;

  const offlineTimeoutRef = useRef(null);

  /** @type {(status: PresenceStatus, dispositivo?: string) => Promise<void>} */
  const updatePresence = useCallback(
    async (status, dispositivo = DEVICE_TYPE) => {
      if (!userId) {
        console.log('usePresence: userId es null, saltando actualización');
        return;
      }

      try {
        console.log(`usePresence: Actualizando presencia para ${userId} -> ${status}`);
        // Upsert: insertar o actualizar
        const { error } = await api.supabase
          .from('user_presence')
          .upsert(
            {
              user_id: userId,
              status,
              usuario_nombre: usuarioNombre,
              dispositivo,
              ultimo_visto: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (error) {
          console.error('Error updating presence:', error);
        } else {
          console.log(`usePresence: Presencia actualizada exitosamente para ${userId}`);
        }
      } catch (err) {
        console.error('Error in updatePresence:', err);
      }
    },
    [userId, usuarioNombre, DEVICE_TYPE]
  );

  // Resets offline timeout cuando hay actividad
  const resetOfflineTimeout = useCallback(() => {
    // Limpiar timeout anterior
    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current);
    }

    // Establecer nuevo timeout para marcar offline
    offlineTimeoutRef.current = setTimeout(() => {
      console.log(`usePresence: Timeout sin heartbeat - marcando offline para ${userId}`);
      updatePresence('offline');
    }, OFFLINE_TIMEOUT);
  }, [userId, updatePresence, OFFLINE_TIMEOUT]);

  // Marcar como online al montar y cuando userId cambia de null a un valor real
  useEffect(() => {
    if (userId) {
      console.log(`usePresence: userId cambió a ${userId}, marcando como online`);
      updatePresence('online');
      resetOfflineTimeout();
    }
  }, [userId, updatePresence, resetOfflineTimeout]);

  // Heartbeat: enviar ping cada 2-3s para mantener online
  // (pero solo si la página es visible)
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      // Solo enviar heartbeat si la página es visible
      if (!document.hidden && userId) {
        updatePresence('online');
        resetOfflineTimeout();
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeatInterval);
  }, [updatePresence, resetOfflineTimeout, userId, HEARTBEAT_INTERVAL]);

  // Detectar si la página está visible (foreground/background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Usuario cambió a otra pestaña o minimizó - marcar offline inmediatamente
        console.log(`usePresence: Página oculta, marcando offline para ${userId}`);
        updatePresence('offline');
        if (offlineTimeoutRef.current) {
          clearTimeout(offlineTimeoutRef.current);
        }
      } else {
        // Usuario volvió a la pestaña
        console.log(`usePresence: Página visible, marcando online para ${userId}`);
        updatePresence('online');
        resetOfflineTimeout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // En móvil, también detectar cuando la app se minimiza (pagehide)
    const handlePageHide = () => {
      console.log(`usePresence: Evento pagehide, marcando offline para ${userId}`);
      updatePresence('offline');
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [updatePresence, resetOfflineTimeout, userId]);

  // Detectar pérdida de conexión de red
  useEffect(() => {
    const handleOffline = () => {
      console.log(`usePresence: Evento offline detectado para ${userId}`);
      updatePresence('offline');
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }
    };
    const handleOnline = () => {
      console.log(`usePresence: Evento online detectado para ${userId}`);
      updatePresence('online');
      resetOfflineTimeout();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [updatePresence, resetOfflineTimeout, userId]);

  // Detectar cierre de navegador/pestaña - último intento con beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userId) {
        console.log(`usePresence: beforeunload - intentando marcar offline para ${userId}`);
        updatePresence('offline');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId, updatePresence]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }
    };
  }, []);

  return { updatePresence };
}
