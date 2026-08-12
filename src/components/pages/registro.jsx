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
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-xl text-center">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">
            Revisá tu correo
          </h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Hacé clic en el enlace para activar tu cuenta.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary py-2.5 px-6"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-20">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-xl">
        <h2 className="font-headline text-headline-md text-on-surface text-center mb-6">
          Crear Cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-error-container border border-error text-on-error-container rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-label-bold mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              className="input"
            />
          </div>

          <div>
            <label className="block font-label-bold mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              placeholder="Tu apellido"
              className="input"
            />
          </div>

          <div>
            <label className="block font-label-bold mb-1">
              DNI (opcional)
            </label>
            <input
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Sin puntos ni guiones"
              className="input"
            />
          </div>

          <div>
            <label className="block font-label-bold mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="input"
            />
          </div>

          <div>
            <label className="block font-label-bold mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="input w-full pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-primary"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="m4 4 16 16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-on-surface-variant text-sm">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>

          <button
            onClick={() => navigate("/")}
            className="text-on-surface-variant text-sm hover:text-on-surface cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registro;
