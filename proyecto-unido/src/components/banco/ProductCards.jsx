import React from "react";
import StaticText from "./StaticText";

const cards = [
  {
    title: "Tarjeta Cash Internacional",
    img: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/01/Prepagada-cash.png",
  },
  {
    title: "Cash Moneda Extranjera",
    img: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/01/cuenta-cash-moneda-extranjera.png",
  },
];

export default function ProductCards() {
  return (
    <div className="flex flex-col md:flex-row" style={{ backgroundColor: "#F5F5F5" }}>
      {/* Left side — two product cards */}
      <div className="flex w-full md:w-1/2">
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}
          >
            <img
              src={card.img}
              alt={card.title}
              style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
              className="md:h-[320px]"
            />
            <div
              style={{
                backgroundColor: "#3C44D1",
                padding: "16px 20px",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <StaticText
                tag="h2"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#FFFFFF",
                }}
              >
                {card.title}
              </StaticText>
            </div>
          </div>
        ))}
      </div>

      {/* Right side — text block */}
      <div
        className="w-full md:w-1/2 px-6 py-8 md:px-14 md:py-0"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "200px",
        }}
      >
        <StaticText
          tag="h2"
          className="text-3xl md:text-[36px]"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "#02004D",
            marginBottom: "16px",
          }}
        >
          Tenemos la <strong>solución a tus necesidades</strong>
        </StaticText>
        <StaticText
          tag="p"
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#333",
          }}
        >
          Conoce los productos <strong>ideales para ti</strong>, te ayudamos a cumplir tu metas y facilitar tus necesidades.
        </StaticText>
      </div>
    </div>
  );
}