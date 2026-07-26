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
    <section className="relative overflow-hidden my-8">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[3px] opacity-30"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="relative z-10 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-dark-text">
          Novedades
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 justify-items-center px-4">
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
