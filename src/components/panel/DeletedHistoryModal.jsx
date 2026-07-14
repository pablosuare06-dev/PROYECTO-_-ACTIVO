import { Download, X, Trash2 } from "lucide-react";

export default function DeletedHistoryModal({ isOpen, onClose, records, error, onDownload, onDeleteRecord }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Información eliminada ({records.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              disabled={!records.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Descargar TXT
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              title="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {error ? (
            <p className="text-sm text-red-600 text-center py-8">{error}</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay información eliminada</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-gray-100 bg-gray-50"
                >
                  <span className="text-xs font-mono text-gray-700 break-words">{record.line}</span>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="shrink-0 p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar este registro del historial"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}