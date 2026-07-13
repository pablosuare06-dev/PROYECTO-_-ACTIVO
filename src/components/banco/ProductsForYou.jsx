import React from "react";
import StaticText from "./StaticText";

const items = [
  {
    title: "Productos para ti",
    img: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/01/para-ti-.png",
  },
  {
    title: "Productos para tu negocio",
    img: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/01/para-tu-negocio.png",
  },
];

export default function ProductsForYou() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        padding: "60px 48px",
        gap: "0",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {/* Left side — two product cards */}
      <div style={{ display: "flex", gap: "0", flex: "0 0 50%" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <img
              src={item.img}
              alt={item.title}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
                display: "block",
              }}
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
                  fontSize: "18px",
                  color: "#FFFFFF",
                }}
              >
                {item.title}
              </StaticText>
            </div>
          </div>
        ))}
      </div>

      {/* Right side — text block */}
      <div
        style={{
          flex: "0 0 50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "60px",
          paddingRight: "40px",
          minHeight: "320px",
        }}
      >
        <StaticText
          tag="h2"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize: "36px",
            lineHeight: 1.3,
            color: "#02004D",
            marginBottom: "16px",
          }}
        >
          Todo lo que necesitas <strong>para ti y para tu negocio</strong>
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
          Descubre todos los productos y servicios que cubren tus necesidades.
        </StaticText>
      </div>
    </div>
  );
}