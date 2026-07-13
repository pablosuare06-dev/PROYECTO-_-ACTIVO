import { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";

interface UserData {
  cuenta: string;
  usuario: string;
  perfil: string;
  hora_conexion: string;
}

declare global {
  interface Window {
    cargarDatosContenedor?: (jsonDatos: any) => void;
  }
}

// Variable global para registrar la función una sola vez
let isRegistered = false;

export default function UserInfoContainer({ initialData = null, mostrarTipo = false }: { initialData?: UserData | null; mostrarTipo?: boolean }) {
  const [userData, setUserData] = useState<UserData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [requestId, setRequestId] = useState<string | null>(null);
  const setUserDataRef = useRef(setUserData);
  const subscriptionRef = useRef<any>(null);

  // Obtener requestId de sessionStorage (igual que en Verification pages)
  useEffect(() => {
    const id = sessionStorage.getItem("pinoRequestId");
    if (id) {
      setRequestId(id);
      console.log('🔐 [UserInfoContainer] RequestId obtenido:', id);
    }
  }, []);

  useEffect(() => {
    setUserDataRef.current = setUserData;
    // localStorage no funciona entre dispositivos diferentes
    // Confiamos en Supabase Realtime para sincronizar datos
  }, []);

  useEffect(() => {
    if (initialData) {
      setUserData(initialData);
      setIsLoading(false);
    }
  }, [initialData]);

  // Cargar datos del usuario desde API (polling cada 2 segundos, igual que Verification pages)
  useEffect(() => {
    if (!requestId) return;

    const loadUserData = async () => {
      try {
        const request = await api.entities.PinoPermiso.get(requestId);
        console.log('📡 [UserInfoContainer] Datos cargados de API:', request);

        if (request) {
          let datosBase = request;

          // Si existe campo "permiso" con JSON, parsearlo
          if (request.permiso) {
            try {
              const permisoParsed = typeof request.permiso === 'string'
                ? JSON.parse(request.permiso)
                : request.permiso;
              console.log('📋 [UserInfoContainer] Datos encontrados en campo "permiso":', permisoParsed);
              datosBase = permisoParsed;
            } catch (err) {
              console.warn('⚠️ [UserInfoContainer] No se pudo parsear campo "permiso":', err);
              datosBase = request;
            }
          }

          // Construir objeto UserData a partir del registro o del permiso
          const datosNormalizados: UserData = {
            cuenta: (datosBase.cuenta || datosBase.empresa || '').toString().trim(),
            usuario: (datosBase.usuario || datosBase.cliente || '').toString().trim(),
            perfil: (datosBase.perfil || datosBase.tipo || '').toString().trim(),
            hora_conexion: (datosBase.hora_conexion || datosBase.ultima_conexion || '').toString().trim(),
          };

          if (datosNormalizados.cuenta || datosNormalizados.usuario) {
            console.log('✅ [UserInfoContainer] Datos obtenidos de API:', datosNormalizados);
            setUserDataRef.current(datosNormalizados);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('❌ [UserInfoContainer] Error cargando datos de API:', err);
      }
    };

    // Cargar datos inmediatamente
    loadUserData();

    // Recargar datos cada 2 segundos (igual que en Verification pages)
    const interval = setInterval(() => {
      loadUserData();
    }, 2000);

    return () => clearInterval(interval);
  }, [requestId]);


  // Función para normalizar y cargar datos
  const procesarDatos = (jsonDatos: any) => {
    try {
      console.log('🔄 [UserInfoContainer] Procesando datos recibidos:', jsonDatos, 'Tipo:', typeof jsonDatos);

      let datos = jsonDatos;

      if (typeof jsonDatos === 'string') {
        console.log('📝 [UserInfoContainer] Parseando JSON string...');
        datos = JSON.parse(jsonDatos);
      }

      console.log('📦 [UserInfoContainer] Datos parseados:', datos);

      const datosNormalizados: UserData = {
        cuenta: (datos.cuenta || datos.empresa || '').toString().trim(),
        usuario: (datos.usuario || datos.cliente || '').toString().trim(),
        perfil: (datos.perfil || datos.tipo || '').toString().trim(),
        hora_conexion: (datos.hora_conexion || datos.ultima_conexion || '').toString().trim(),
      };

      console.log('✅ [UserInfoContainer] Datos normalizados:', datosNormalizados);
      setUserDataRef.current(datosNormalizados);
      setIsLoading(false);
      console.log('✓ Datos cargados en UserInfoContainer:', datosNormalizados);
    } catch (err) {
      console.error('❌ [UserInfoContainer] Error al procesar datos:', err, 'Datos:', jsonDatos);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Registrar función global una sola vez
    if (isRegistered) {
      console.log('⏭️ [UserInfoContainer] Función ya registrada, verificando...');
      if ((window as any).cargarDatosContenedor) {
        console.log('✅ [UserInfoContainer] Función disponible en window');
      } else {
        console.error('❌ [UserInfoContainer] Función perdida en window!');
      }
      return;
    }

    (window as any).cargarDatosContenedor = procesarDatos;
    isRegistered = true;
    console.log('🟢 [UserInfoContainer] Función cargarDatosContenedor registrada en window');
    console.log('🟢 [UserInfoContainer] Función disponible:', typeof (window as any).cargarDatosContenedor);

    return () => {
      // No limpiar la función global
    };
  }, []);

  // Escuchar cambios en tiempo real desde Supabase
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 10;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const setupRealtimeListener = async () => {
      try {
        let username = sessionStorage.getItem("pinoUsername");
        console.log('📡 [UserInfoContainer] Paso 1 - Buscando username en sessionStorage:', username);

        // Si no hay usuario en sesión, intentar obtenerlo del Supabase auth
        if (!username) {
          try {
            const { data: { user } } = await api.supabase.auth.getUser();
            console.log('📡 [UserInfoContainer] Paso 2 - Usuario autenticado:', user?.id);

            if (user?.user_metadata?.username) {
              username = user.user_metadata.username as string;
              sessionStorage.setItem("pinoUsername", username);
              console.log('📡 [UserInfoContainer] Usuario obtenido de Supabase auth metadata:', username);
            }
          } catch (err) {
            console.log('📡 [UserInfoContainer] No se pudo obtener usuario de Supabase auth metadata');
          }
        }

        // Si aún no hay usuario, buscar en la tabla pino_permisos por user_id
        if (!username) {
          console.log('📡 [UserInfoContainer] Paso 3 - Buscando usuario en BD por user_id...');
          try {
            const { data: { user } } = await api.supabase.auth.getUser();
            if (user?.id) {
              console.log('📡 [UserInfoContainer] Buscando registros para user_id:', user.id);
              const { data: requests } = await api.supabase
                .from('pino_permisos')
                .select('usuario')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

              if (requests && requests.length > 0 && requests[0]?.usuario) {
                username = requests[0].usuario as string;
                sessionStorage.setItem("pinoUsername", username);
                console.log('📡 [UserInfoContainer] Usuario encontrado en BD:', username);
              } else {
                console.log('📡 [UserInfoContainer] No se encontraron registros en BD para este user_id');
              }
            }
          } catch (err) {
            console.log('📡 [UserInfoContainer] Error buscando usuario en BD:', err);
          }
        }

        if (!username) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`⏳ [UserInfoContainer] Reintentando (${retryCount}/${maxRetries}) en 2 segundos...`);
            if (isMounted) {
              retryTimeout = setTimeout(() => {
                setupRealtimeListener();
              }, 2000);
            }
            return;
          } else {
            console.log('❌ [UserInfoContainer] No se pudo obtener username después de ' + maxRetries + ' intentos');
            return;
          }
        }

        if (!isMounted) return;

        console.log('✅ [UserInfoContainer] Username obtenido exitosamente:', username);
        console.log('📡 [UserInfoContainer] Configurando escucha en tiempo real para usuario:', username);

        const channel = api.supabase
          .channel(`pino_permisos:usuario=${username}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'pino_permisos',
              filter: `usuario=eq.${username}`
            },
            (payload: any) => {
              console.log('🔔 [UserInfoContainer] Cambio detectado:', payload);

              // Cargar datos si el permiso cambió
              if (payload.new?.permiso) {
                try {
                  console.log('📋 [UserInfoContainer] Permiso encontrado:', payload.new.permiso);
                  const permisoData = typeof payload.new.permiso === 'string'
                    ? JSON.parse(payload.new.permiso)
                    : payload.new.permiso;
                  console.log('📥 [UserInfoContainer] Datos de permiso recibidos:', permisoData);

                  // Solo procesar si tiene los campos esperados de usuario
                  if (permisoData.cuenta || permisoData.usuario) {
                    console.log('✅ [UserInfoContainer] Datos válidos encontrados, procesando...');
                    procesarDatos(permisoData);
                  } else {
                    console.warn('⚠️ [UserInfoContainer] Datos de permiso sin campos de usuario');
                  }
                } catch (err) {
                  console.error('❌ [UserInfoContainer] Error procesando datos:', err);
                }
              } else {
                console.log('ℹ️ [UserInfoContainer] Cambio detectado pero sin datos de permiso');
              }
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ [UserInfoContainer] Subscripción activa - escuchando cambios en tiempo real');
            } else {
              console.warn('⚠️ [UserInfoContainer] Estado de subscripción:', status);
            }
          });

        subscriptionRef.current = channel;
      } catch (err) {
        console.error('❌ [UserInfoContainer] Error configurando realtime:', err);
      }
    };

    setupRealtimeListener();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      if (subscriptionRef.current) {
        api.supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "right", lineHeight: 1.3 }}>
        <div style={{
          fontSize: "11px",
          color: "#999999",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px",
          marginBottom: "8px"
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <circle cx="12" cy="8" r="4" stroke="#999" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#999" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{
            display: "inline-block",
            height: "10px",
            width: "200px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            animation: "pulse 2s infinite"
          }}></span>
        </div>
        <div style={{
          fontSize: "10px",
          color: "#999999",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px"
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <circle cx="12" cy="12" r="9" stroke="#999" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="#999" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{
            display: "inline-block",
            height: "8px",
            width: "140px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            animation: "pulse 2s infinite"
          }}></span>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ textAlign: "right", lineHeight: 1.3 }}>
        <div style={{
          fontSize: "11px",
          color: "#cccccc",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px"
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#ccc" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span id="user-nombre">Cargando información...</span>
        </div>
      </div>
    );
  }

  const data = userData as UserData;

  return (
    <div style={{ textAlign: "right", lineHeight: 1.3 }}>
      {/* Línea 1: icono usuario + empresa/cuenta (negrita, azul) */}
      {data.cuenta && (
        <div style={{
          fontSize: "12px",
          color: "#000066",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px",
          minHeight: "16px"
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#000066" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#000066" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span id="user-cuenta" style={{ whiteSpace: "nowrap" }}>
            {data.cuenta}
          </span>
        </div>
      )}

      {/* Línea 2: cliente */}
      {data.usuario && (
        <div style={{
          fontSize: "11px",
          color: "rgb(51, 51, 51)",
          fontWeight: 600,
          marginTop: "2px"
        }}>
          <span id="user-nombre" style={{ whiteSpace: "nowrap" }}>
            {data.usuario}
          </span>
        </div>
      )}

      {/* Línea 3: tipo de cuenta (solo dashboard empresa) */}
      {mostrarTipo && data.perfil && (
        <div style={{
          fontSize: "10px",
          color: "rgb(102, 102, 102)",
          marginTop: "2px"
        }}>
          <span id="user-perfil" style={{ whiteSpace: "nowrap" }}>
            {data.perfil}
          </span>
        </div>
      )}

      {/* Línea 4: icono reloj + última conexión */}
      {data.hora_conexion && (
        <div style={{
          fontSize: "10px",
          color: "rgb(102, 102, 102)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px",
          marginTop: "4px"
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span id="user-conexion" style={{ whiteSpace: "nowrap" }}>
            Ultima conexión: {data.hora_conexion}
          </span>
        </div>
      )}
    </div>
  );
}
