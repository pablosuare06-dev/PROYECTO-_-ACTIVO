import React from "react";
import StaticText from "./StaticText";

export default function HeroSection() {
  return (
    <div className="flex flex-col md:flex-row" style={{ marginTop: "86px", minHeight: "460px" }}>
      {/* Left panel — primary blue */}
      <div
        className="w-full md:flex-1 md:max-w-[50%]"
        style={{
          backgroundColor: "#3C44D1",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="w-full px-6 py-10 md:px-12 md:py-12"
          style={{
            borderTop: "1px solid #02004D",
            borderBottom: "1px solid #02004D",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <StaticText
              tag="h2"
              className="text-4xl md:text-[40px]"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "#F4F5FA",
              }}
            >
              Haz crecer tu negocio con el Punto de Venta Activo
            </StaticText>
            <StaticText
              tag="p"
              className="text-lg md:text-[20px]"
              style={{
                lineHeight: 1.4,
                color: "#F4F5FA",
                marginTop: "12px",
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              Solicítalo hoy en cualquiera de nuestras oficinas
            </StaticText>
          </div>
        </div>
      </div>

      {/* Right panel — banner image */}
      <div className="w-full md:flex-1 md:max-w-[50%]" style={{ position: "relative", minHeight: "460px" }}>
        <img
          alt="Banner"
          src="https://prod-wordpress.bancoactivo.com/wp-content/uploads/2026/06/Punto-de-venta.png"
          style={{
            objectFit: "cover",
            width: "100%",
            display: "block",
            height: "300px",
          }}
          className="md:!h-full md:absolute md:inset-0"
        />
        {/* Overlay text on the image — "Tu negocio merece estar +Activo" */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            textAlign: "right",
          }}
        >
          <StaticText
            tag="div"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "28px",
              fontWeight: 300,
              color: "#FFFFFF",
              lineHeight: 1.2,
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            Tu negocio
          </StaticText>
          <StaticText
            tag="div"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "28px",
              fontWeight: 300,
              color: "#FFFFFF",
              lineHeight: 1.2,
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            merece estar
          </StaticText>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end" }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "40px",
                fontWeight: 700,
                color: "#FF7900",
              }}
            >
              +
            </span>
            <StaticText
              tag="span"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "48px",
                fontWeight: 700,
                color: "#FFFFFF",
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              Activo
            </StaticText>
          </div>
        </div>
      </div>
    </div>
  );
}