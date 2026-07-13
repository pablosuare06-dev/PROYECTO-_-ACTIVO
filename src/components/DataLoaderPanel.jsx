import { useState } from "react";

/**
 * Botón flotante para pegar JSON del portapapeles
 * @typedef {{type: 'success'|'error', message: string}} StatusMessage
 */
export default function DataLoaderPanel() {
  const [loading, setLoading] = useState(false);
  /** @type {[StatusMessage|null, Function]} */
  const [status, setStatus] = useState(null);

  const handlePegJSON = async () => {
    try {
      setLoading(true);

      // Leer del portapapeles
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        setStatus({
          type: "error",
          message: "✗ Portapapeles vacío"
        });
        setLoading(false);
        setTimeout(() => setStatus(null), 2000);
        return;
      }

      // Parsear JSON
      const data = JSON.parse(clipboardText);

      // Cargar datos
      if (window.cargarDatosContenedor) {
        window.cargarDatosContenedor(data);
        setStatus({
          type: "success",
          message: "✓ Datos cargados"
        });
        setTimeout(() => setStatus(null), 2000);
      } else {
        setStatus({
          type: "error",
          message: "✗ Componente no montado"
        });
      }
    } catch (err) {
      let errorMsg = "✗ JSON inválido";

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = "✗ Sin acceso al portapapeles";
        } else if (err instanceof SyntaxError) {
          errorMsg = "✗ JSON inválido";
        }
      }

      setStatus({
        type: "error",
        message: errorMsg
      });
      setTimeout(() => setStatus(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handlePegJSON}
        disabled={loading}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 99999,
          padding: "12px 16px",
          backgroundColor: loading ? "#90caf9" : "#3366cc",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "24px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          fontFamily: "Arial, Helvetica, sans-serif",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "auto"
        }}
        title="Pegar JSON del portapapeles"
      >
        <span style={{ fontSize: "14px" }}>📋</span>
        {loading ? "⏳ Cargando..." : "Peg JSON"}
      </button>

      {/* Notificación de estado */}
      {status && (
        <div
          style={{
            position: "fixed",
            bottom: "70px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "Arial, Helvetica, sans-serif",
            backgroundColor: status.type === "success" ? "#c8e6c9" : "#ffcdd2",
            color: status.type === "success" ? "#2e7d32" : "#c62828",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease",
          }}
        >
          {status.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
