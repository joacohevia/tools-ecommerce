import { useEffect, useState } from "react";
import heroImg from "../../../public/herramientas-fondo-2.jpg";
import { getProductos } from "../../http";
import Card from "../card";


const SeccionNov = () => {
  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    getProductos().then((data) => setNovedades(data.slice(0, 6))).catch(console.error);
  }, []);

  if (!novedades.length) return null;

  return (
    <section className="relative overflow-hidden py-section-padding my-1">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[3px] opacity-40"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 py-8">
        <h2 className="font-headline text-headline-lg text-white text-center mb-8">
          Novedades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter justify-items-center px-4 max-w-container-max mx-auto">
          {novedades.map((nov) => (
            <Card
              key={nov.id}
              producto={nov}
              onDelete={(id) => setNovedades((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeccionNov;
