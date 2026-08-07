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
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden group my-8">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <h2 className="font-headline text-headline-xl text-white mb-4">
          Nuestras Categorías
        </h2>
        <p className="font-body text-body-lg text-white/80 max-w-xl mb-8">
          Descubrí nuestra amplia variedad de herramientas para cada necesidad
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              to={`/productos?categoria=${cat.slug}`}
              className="btn-primary rounded px-6 py-3 no-underline"
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeccionHerramientas;
