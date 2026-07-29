import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Página de inicio de sesión.
 * Conecta con Supabase Auth a través de AuthContext.
 * Muestra estados de carga, errores y redirige al home tras login exitoso.
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      navigate(data.perfil?.rol === 'admin' ? '/productos' : '/home');
    } catch (err) {
      setError(err.message === "Invalid login credentials"
        ? "Correo o contraseña incorrectos"
        : "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-blue px-4">
      <div className="w-full max-w-md bg-dark-blue border border-white/20 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-dark-text text-center mb-6">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-dark-muted text-sm">
            ¿No tenés cuenta?{" "}
            <Link to="/registro" className="text-blue-400 hover:text-blue-300 font-medium">
              Quiero registrarme
            </Link>
          </p>

          <button
            onClick={() => navigate("/")}
            className="text-dark-muted text-sm hover:text-dark-text cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
