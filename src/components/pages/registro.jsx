import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Página de registro de usuario.
 * Crea la cuenta en Supabase Auth y el perfil en la tabla perfiles
 * vía POST /api/perfiles (con JWT).
 * Maneja los estados de carga, error y confirmación de correo.
 */
const Registro = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signup({ email, password, nombre, apellido, dni });

      if (data.session) {
        navigate("/home");
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
        setError("Ya existe una cuenta con ese correo electrónico");
      } else {
        setError("Error al registrarse. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-blue px-4">
        <div className="w-full max-w-md bg-dark-blue border border-white/20 rounded-xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-semibold text-dark-text mb-4">
            Revisá tu correo
          </h2>
          <p className="text-dark-muted text-sm mb-6">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Hacé clic en el enlace para activar tu cuenta.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-blue px-4">
      <div className="w-full max-w-md bg-dark-blue border border-white/20 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-dark-text text-center mb-6">
          Crear Cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              placeholder="Tu apellido"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              DNI (opcional)
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Sin puntos ni guiones"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-dark-muted text-sm">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Iniciar sesión
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

export default Registro;
