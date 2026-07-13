import { useEffect, useCallback } from 'react';
import { api } from '@/api/apiClient';

/**
 * Hook que maneja presencia online/offline del usuario
 * - Registra el usuario como online al montar
 * - Envía heartbeat cada 5s
 * - Detecta page visibility changes
 * - Marca offline al desmontar
 */
export function usePresence(userId, usuarioNombre) {
  const HEARTBEAT_INTERVAL = 5000; // 5 segundos
  const DEVICE_TYPE = /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';

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

  // Marcar como online al montar y cuando userId cambia de null a un valor real
  useEffect(() => {
    if (userId) {
      console.log(`usePresence: userId cambió a ${userId}, marcando como online`);
      updatePresence('online');
    }
  }, [userId, updatePresence]);

  // Heartbeat: enviar ping cada 5s para evitar timeout (pero solo si la página es visible)
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      // Solo enviar heartbeat si la página es visible
      if (!document.hidden) {
        updatePresence('online');
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeatInterval);
  }, [updatePresence]);

  // Detectar si la página está visible (foreground/background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Usuario cambió a otra pestaña o minimizó
        updatePresence('offline');
      } else {
        // Usuario volvió a la pestaña
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updatePresence]);

  // Detectar cierre de navegador/pestaña
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Intentar marcar offline de forma síncrona (mejor esfuerzo)
      // Nota: beforeunload no garantiza que se complete la actualización,
      // pero lo intentamos para mejorar la experiencia
      if (userId) {
        api.supabase
          .from('user_presence')
          .update({ status: 'offline' })
          .eq('user_id', userId)
          .then()
          .catch(err => console.error('Error marking offline:', err));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId]);

  // Detectar pérdida de conexión
  useEffect(() => {
    const handleOffline = () => updatePresence('offline');
    const handleOnline = () => updatePresence('online');

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [updatePresence]);

  return { updatePresence };
}
