import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileActivoOpen, setMobileActivoOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activoEnLineaItems = [
    { label: "Personas", href: "/pino-pers", internal: true },
    { label: "Empresas", href: "/pino-empr", internal: true },
    { label: "Tarjeta de crédito", href: "https://www.credicard.com.ve/web/login/activo" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E5E5",
          height: "86px",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          fontFamily: "'Poppins', 'Raleway', sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginRight: "40px", flexShrink: 0 }}>
          <img
            src="https://www.bancoactivo.com/logo.svg"
            alt="Activo Banco Universal"
            style={{ height: "30px", width: "199px", display: "block" }}
          />
        </div>

        {/* Desktop Nav Links */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: "28px", flex: 1 }}
        >
          {["Para Ti", "Para tu Negocio", "Canales de Atención", "Tasas y tarifas", "Límites de operaciones"].map((label) => (
            <span
              key={label}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#02004D",
                cursor: "default",
                whiteSpace: "nowrap",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Activo en Línea Button — desktop only */}
        <div ref={dropdownRef} style={{ position: "relative" }} className="hidden md:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              backgroundColor: "#3C44D1",
              border: "none",
              color: "#FFFFFF",
              padding: "0 12px",
              width: "210px",
              height: "32px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
              borderRadius: "0",
            }}
          >
            Activo en Línea
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "32px",
                right: 0,
                backgroundColor: "#3C44D1",
                minWidth: "210px",
                zIndex: 200,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {activoEnLineaItems.map((item, idx, arr) => (
                <a
                  key={item.label}
                  href={item.internal ? undefined : item.href}
                  target={!item.internal && item.href !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  onClick={(e) => { e.preventDefault(); setDropdownOpen(false); if (item.internal) navigate(item.href); else if (item.href !== "#") window.open(item.href, "_blank"); }}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#FFFFFF",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    textDecoration: "none",
                    borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a31b5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden ml-auto"
          onClick={() => setMenuOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#02004D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile full-screen menu overlay */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#F2F2F7",
            zIndex: 200,
            overflowY: "auto",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px 16px",
              backgroundColor: "#F2F2F7",
            }}
          >
            <img
              src="https://www.bancoactivo.com/logo.svg"
              alt="Activo Banco Universal"
              style={{ height: "30px", width: "199px", display: "block" }}
            />
            <button
              onClick={() => { setMenuOpen(false); setDropdownOpen(false); setMobileActivoOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#02004D" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Menu content */}
          <div style={{ padding: "8px 24px 24px" }}>
            {/* Activo en Línea — toggle sub-items on press */}
            <div style={{ marginBottom: "4px" }}>
              <button
                onClick={() => setMobileActivoOpen(!mobileActivoOpen)}
                style={{
                  width: "100%",
                  backgroundColor: "#3C44D1",
                  border: "none",
                  color: "#FFFFFF",
                  padding: "14px 20px",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "block",
                  boxSizing: "border-box",
                }}
              >
                Activo en Línea
              </button>
              {mobileActivoOpen && activoEnLineaItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileActivoOpen(false);
                    if (item.internal) {
                      navigate(item.href);
                    } else if (item.href !== "#") {
                      window.open(item.href, "_blank");
                    }
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    backgroundColor: "#3C44D1",
                    color: "#FFFFFF",
                    padding: "14px 20px",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "15px",
                    fontWeight: 400,
                    textDecoration: "none",
                    borderTop: "1px solid rgba(255,255,255,0.25)",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Nav links */}
            {[
              { label: "Para Ti", hasArrow: true },
              { label: "Para tu Negocio", hasArrow: true },
              { label: "Canales de Atención", hasArrow: false },
              { label: "Tasas y tarifas", hasArrow: false },
              { label: "Límites de operaciones", hasArrow: false },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid #E0E0E0",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#02004D",
                  }}
                >
                  {item.label}
                </span>
                {item.hasArrow && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#02004D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}