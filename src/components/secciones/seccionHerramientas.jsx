import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../../../public/herramientas-fondo.jpg";
import { getCategorias } from "../../http";

const SeccionHerramientas = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(console.error);
  }, []);

  if (!categorias.length) return null;

  return (
    <section className="relative overflow-hidden my-8">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[2px] opacity-30"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="relative z-10 py-8 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6 text-dark-text">
          Herramientas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              to={`/productos?categoria=${cat.slug}`}
              className="flex flex-col items-center p-4 border border-white/10 bg-dark-blue/80 backdrop-blur-sm rounded-lg hover:shadow-lg hover:bg-dark-blue hover:border-blue-500/30 transition cursor-pointer"
            >
              <span className="text-2xl font-bold text-dark-text mb-2">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeccionHerramientas;
