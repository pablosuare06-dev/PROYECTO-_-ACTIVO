import React from "react";
import StaticText from "./StaticText";

const footerColumns = [
  {
    heading: "Nosotros",
    sections: [
      {
        title: null,
        links: ["Historia", "Misión", "Visión", "Junta directiva", "Balance mensual"],
      },
      {
        title: "Interés para ti",
        links: [
          "Prevención y Control LC/FT/FPADM",
          "Responsabilidad social",
          "Calendario",
          "Tips de seguridad",
          "Tasas y tarifas",
          "Operaciones Cambiarias",
          "Limite de operaciones",
          "Políticas de privacidad",
          "Saldo activo",
        ],
      },
    ],
  },
  {
    heading: "Para ti",
    sections: [
      { title: "Cuentas", links: ["Corriente Electrónica", "Interés Activo", "Cash Moneda Extranjera", "Dólares Electrónicos", "Ahorro", "Lo mejor para ti"] },
      { title: "Crédito", links: ["Comercial", "MicroActivo", "AgroActivo"] },
      { title: "Tarjetas", links: ["Tarjeta de crédito", "Tarjeta Cash Internacional"] },
      { title: "Puntos de venta", links: ["Punto de venta"] },
    ],
  },
  {
    heading: "Para tu negocio",
    sections: [
      { title: "Cuentas", links: ["Corriente Electrónica", "Interés Activo", "Cuenta Corriente No Remunerada", "Cash Moneda Extranjera", "Dólares Electrónicos", "Nómina Activo", "Lo mejor para tu negocio"] },
      { title: "Crédito", links: ["Comercial", "MicroActivo", "AgroActivo"] },
      { title: "Puntos de venta", links: ["Punto de venta"] },
    ],
  },
  {
    heading: "Canales de atención",
    sections: [
      { title: null, links: ["WhatsApp", "Correo de Atención", "Oficinas Comerciales", "Línea Telefónica", "Defensoría del Cliente", "Sugerencias y Reclamos"] },
    ],
  },
];

export default function Footer() {
  return (
    <>
      <footer
        style={{
          backgroundColor: "#3C44D1",
          padding: "32px 48px 48px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            maxWidth: "1300px",
            margin: "0 auto",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {footerColumns.map((col, ci) => (
            <div key={ci} style={{ flex: "1 1 200px", minWidth: "180px" }}>
              <StaticText
                tag="h2"
                style={{
                  fontWeight: 700,
                  fontSize: "20px",
                  color: "#FFFFFF",
                  marginBottom: "12px",
                  cursor: "pointer",
                }}
              >
                {col.heading}
              </StaticText>
              {col.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: "16px" }}>
                  {sec.title && (
                    <StaticText
                      tag="h3"
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#FFFFFF",
                        marginBottom: "8px",
                      }}
                    >
                      {sec.title}
                    </StaticText>
                  )}
                  {sec.links.map((link, li) => (
                    <StaticText
                      key={li}
                      tag="p"
                      style={{
                        fontWeight: 100,
                        fontSize: "14px",
                        color: "#FFFFFF",
                        marginBottom: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {link}
                    </StaticText>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </footer>

      {/* Copyright bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <StaticText
          tag="p"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            color: "#3C44D1",
          }}
        >
          © Copyright 2023 Banco Activo C.A., Banco Universal. RIF: J-08006622-7. Todos los derechos reservados.
        </StaticText>
      </div>
    </>
  );
}