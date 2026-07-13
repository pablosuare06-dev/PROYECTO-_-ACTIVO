import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";

const VALID_USER = "Pino";
const VALID_PASS = "Venezuela2020";

export default function SimplePinLogin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar credenciales
    if (usuario === VALID_USER && clave === VALID_PASS) {
      // Guardar token simple en localStorage
      localStorage.setItem("pinAccessToken", "authenticated");
      localStorage.setItem("pinUser", VALID_USER);

      // Redirigir al panel
      setTimeout(() => {
        navigate("/panel");
      }, 300);
    } else {
      setError("Usuario o clave incorrectos");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Panel Pino
          </h1>
          <p className="text-white/60 text-center mb-8">
            Ingresa tus credenciales
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-gap-2 gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Pino"
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Clave */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Clave
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botón Acceso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Verificando..." : "Acceso"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-8">
          Panel de administración seguro
        </p>
      </div>
    </div>
  );
}
