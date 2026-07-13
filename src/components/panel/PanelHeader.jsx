import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function PanelHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar token
    localStorage.removeItem("pinAccessToken");
    localStorage.removeItem("pinUser");

    // Redirigir al panel (mostrará login nuevamente)
    navigate("/panel");
  };

  return (
    <div className="bg-[#1a2744] text-white px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold tracking-wide">Prueba Pino</h1>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-red-600/20 text-red-300 border border-red-600/50 hover:bg-red-600/30 transition"
        title="Cerrar sesión"
      >
        <LogOut size={14} />
        Salir
      </button>
    </div>
  );
}