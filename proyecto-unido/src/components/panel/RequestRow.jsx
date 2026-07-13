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
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [loadingJson, setLoadingJson] = useState(false);
  const [loadingEtapaReject, setLoadingEtapaReject] = useState(false);

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
        estado: 'rechazado',
        razon: 'Código de autorización rechazado',
        etapa: '',
      });
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      console.error('Error al rechazar código de autorización:', err);
    } finally {
      setLoadingEtapaReject(false);
    }
  };

  const handlePasteJson = async () => {
    try {
      setLoadingJson(true);
      const data = JSON.parse(jsonInput);

      // Priorizar datos_base64, si no usar url
      const imagenData = data.datos_base64 || data.url;

      if (!imagenData) {
        alert('JSON inválido: debe contener "url" o "datos_base64"');
        return;
      }

      // Actualizar la solicitud con la imagen (URL o base64)
      await api.entities.PinoPermiso.update(request.id, {
        imagen: imagenData,
      });

      setJsonInput("");
      setShowJsonModal(false);
      if (onStatusChange) onStatusChange(request.id);
    } catch (err) {
      console.error('Error al procesar JSON:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoadingJson(false);
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
        {/* NUM - Identificador de tipo + Presencia */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? 'Usuario online' : 'Usuario offline'}
            ></span>
            <span className="font-bold text-gray-800 text-sm">{getTypeIdentifier(request.rif_type || request.tipo)}</span>
            {request.numero_documento && (
              <span className="text-gray-500 font-mono text-xs">{request.numero_documento}</span>
            )}
          </span>
        </td>

        {/* Usuario */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="font-semibold text-gray-800">{request.usuario}</span>
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
              onClick={() => setShowJsonModal(true)}
              className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              title="Pegar JSON con información de imagen"
            >
              Pegar JSON
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

        {/* Etapa */}
        <td className="px-3 py-3 whitespace-nowrap">
          {request.etapa ? (
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
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
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
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

      {/* Modal para pegar JSON */}
      {showJsonModal && (
        <tr>
          <td colSpan={7} className="px-3 py-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pegar información de imagen</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pega aquí el JSON con la información de la imagen:
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='{"url": "https://...", "tipo": "cedula_frontal"}'
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formato esperado: {"{"}"url": "https://...", "tipo": "cedula_frontal"{"}"}
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setJsonInput("");
                      setShowJsonModal(false);
                    }}
                    className="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasteJson}
                    disabled={loadingJson || !jsonInput.trim()}
                    className="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingJson ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
