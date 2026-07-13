import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function VerifySolicitud() {
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError("");
    setSolicitud(null);

    if (!numeroDocumento.trim()) {
      setError("Ingresa tu número de documento");
      return;
    }

    setLoading(true);
    try {
      const data = await api.entities.PinoPermiso.list();
      const encontrada = data.find(
        (s) => s.numero_documento === numeroDocumento.trim()
      );

      if (!encontrada) {
        setError("No se encontró solicitud con ese documento");
      } else {
        setSolicitud(encontrada);
      }
    } catch (err) {
      setError(err.message || "Error al buscar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "aprobado":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "rechazado":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "pendiente":
      default:
        return <Clock className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getStatusTitle = (status) => {
    switch (status) {
      case "aprobado":
        return "Solicitud Aprobada";
      case "rechazado":
        return "Solicitud Rechazada";
      case "pendiente":
      default:
        return "Solicitud en Revisión";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "aprobado":
        return "Tu solicitud ha sido aprobada. Puedes acceder a los servicios.";
      case "rechazado":
        return "Tu solicitud ha sido rechazada.";
      case "pendiente":
      default:
        return "Tu solicitud está siendo revisada. Vuelve a consultar en breve.";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "aprobado":
        return "bg-green-50 border-green-200";
      case "rechazado":
        return "bg-red-50 border-red-200";
      case "pendiente":
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <AuthLayout
      icon={Search}
      title="Verificar Solicitud"
      subtitle="Consulta el estado de tu solicitud"
      footer={
        <>
          ¿Aún no has solicitado?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Crear solicitud
          </Link>
        </>
      }
    >
      <form onSubmit={handleBuscar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="documento">Número de Documento</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="documento"
              type="text"
              placeholder="Ej: 12345678"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              className="pl-10 h-12"
              required
              autoFocus
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Verificar Estado"}
        </Button>
      </form>

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {solicitud && (
        <div className={`mt-6 p-6 rounded-lg border-2 ${getStatusColor(solicitud.status)}`}>
          <div className="flex flex-col items-center text-center space-y-4">
            {getStatusIcon(solicitud.status)}

            <div>
              <h3 className="text-lg font-bold">{getStatusTitle(solicitud.status)}</h3>
              <p className="text-sm text-muted-foreground">
                {getStatusDescription(solicitud.status)}
              </p>
            </div>

            {/* Detalles */}
            <div className="w-full space-y-2 text-left bg-white/50 p-3 rounded text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Documento:</span>
                <span className="font-mono">{solicitud.numero_documento}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nombre:</span>
                <span>{solicitud.usuario}</span>
              </div>
              {solicitud.status !== "pendiente" && solicitud.aprobado_en && (
                <div className="flex justify-between">
                  <span className="font-medium">Procesado:</span>
                  <span className="text-xs">
                    {new Date(solicitud.aprobado_en).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Razón de rechazo */}
            {solicitud.status === "rechazado" && solicitud.razon_rechazo && (
              <div className="w-full bg-white/50 p-3 rounded text-left text-sm border-l-4 border-red-500">
                <p className="font-medium text-red-700 mb-1">Razón del rechazo:</p>
                <p className="text-red-600">{solicitud.razon_rechazo}</p>
              </div>
            )}

            {solicitud.status === "pendiente" && (
              <p className="text-xs text-yellow-600 mt-4">
                ⏳ Por favor, vuelve a consultar en breve
              </p>
            )}
          </div>
        </div>
      )}

      {!error && !solicitud && numeroDocumento && !loading && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Haz clic en "Verificar Estado" para buscar tu solicitud
        </p>
      )}
    </AuthLayout>
  );
}
