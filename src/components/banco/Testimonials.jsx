import React, { useState } from "react";
import StaticText from "./StaticText";

const testimonials = [
  {
    name: "Spacars",
    handle: "@spacars_ve",
    avatar: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/07/spacars2.png",
    text: "Fue muy bonito ver a nuestro primer equipo de operarios genuinamente emocionados cuando les entregaron sus tarjetas; especialmente porque varios no tenían cuenta de banco hasta ahora y para que les pagaran tenían que pedir una prestada. Lo cierto es que, más allá de haberlo hecho a través de Spacars fue una oportunidad de crecimiento para ellos que son jóvenes y estaban felices con sus tarjetas de Activo.",
    hashtag: "#MariangelMolina",
  },
  {
    name: "Provalaverapizza",
    handle: "@provalaverapizza",
    avatar: "https://prod-wordpress.bancoactivo.com/wp-content/uploads/2023/02/verapizza.png",
    text: "Para abril de 2021 estaba recién operado y no podía realizar ninguna de las labores, así que me sentaba como un comensal más a trabajar en mi computadora, y un día tengo sentado a mi lado a una persona que pertenece al equipo de Activo. Luego de contarle mi historia, me invita al banco donde me ofrecieron herramientas y soluciones con las que no contaba, que significaron un gran apoyo para mí en esta etapa de emprendedor y ahora de empresario. Ha sido muy gratificante.",
    hashtag: "#FrancescoLeone",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = testimonials[current];

  return (
    <div
      className="flex flex-col md:flex-row px-6 py-10 md:px-12 md:py-16 gap-10"
      style={{ backgroundColor: "#02004D" }}
    >
      {/* Left — heading */}
      <div className="w-full md:flex-1" style={{ maxWidth: "500px" }}>
        <StaticText
          tag="h2"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "36px",
            color: "#FFFFFF",
            marginBottom: "20px",
          }}
        >
          Testimoniales
        </StaticText>
        <StaticText
          tag="p"
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "15px",
            lineHeight: 1.7,
            color: "#FFFFFF",
          }}
        >
          Nuestros valores, fundamentados en la excelencia, se pueden evidenciar con las palabras de algunos de nuestros clientes, considerándonos su aliado financiero para brindarle las herramientas que les permiten crecer cada día más.
          <br />
          <strong>¡En Activo Banco Universal avanzamos juntos hacia el futuro!</strong>
        </StaticText>
      </div>

      {/* Right — testimonial card */}
      <div className="w-full md:flex-1">
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <img
              src={t.avatar}
              alt={t.name}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div>
              <StaticText
                tag="p"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#02004D",
                }}
              >
                {t.name}
              </StaticText>
              <StaticText
                tag="p"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: "13px",
                  color: "#3C44D1",
                  marginBottom: "12px",
                }}
              >
                {t.handle}
              </StaticText>
              <StaticText
                tag="p"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#333",
                  marginBottom: "12px",
                }}
              >
                {t.text}
              </StaticText>
              <StaticText
                tag="p"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#3C44D1",
                }}
              >
                {t.hashtag}
              </StaticText>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: idx === current ? "#FF7900" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}