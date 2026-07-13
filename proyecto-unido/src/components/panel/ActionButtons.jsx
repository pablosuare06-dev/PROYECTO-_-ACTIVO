import React from "react";
import { Volume2, Trash2, FileText, Settings } from "lucide-react";

export default function ActionButtons({ count, soundOn, onToggleSound, onClearAll, onExportTxt, onConfig }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onToggleSound}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          soundOn
            ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
        }`}
      >
        <Volume2 size={14} />
        Sonido {soundOn ? "ON" : "OFF"}
      </button>

      <button
        onClick={onClearAll}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
      >
        <Trash2 size={14} />
        Limpiar todo
      </button>

      <button
        onClick={onExportTxt}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <FileText size={14} />
        Pino
        <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] min-w-[20px] text-center leading-none">
          {count}
        </span>
      </button>

      <button
        onClick={onConfig}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Settings size={14} />
        Configuración
      </button>
    </div>
  );
}