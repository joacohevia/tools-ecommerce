import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-blue px-4">
      <div className="w-full max-w-md bg-dark-blue border border-white/20 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-dark-text text-center mb-6">
          Iniciar Sesion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Correo electronico
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
              Contrasena
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contrasena"
              className="w-full px-4 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-dark-muted text-sm">
            No tenes cuenta?{" "}
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
