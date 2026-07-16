import { useEffect, useState } from "react";
import Card from "../card";
import { getProductos } from "../../http";

const visible = 3;

const CarrouselOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getProductos({ destacado: true }).then(setOfertas).catch(console.error);
  }, []);

  const prev = () => setIndex((i) => (i <= 0 ? ofertas.length - visible : i - 1));
  const next = () => setIndex((i) => (i >= ofertas.length - visible ? 0 : i + 1));

  if (!ofertas.length) return null;

  return (
    <section className="my-8 relative">
      <h2 className="text-2xl font-semibold mb-4">Ofertas</h2>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {ofertas.map((p) => (
            <div key={p.id} className="mr-4 shrink-0">
              <Card producto={p} />
            </div>
          ))}
        </div>
      </div>
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 cursor-pointer"
        onClick={prev}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 cursor-pointer"
        onClick={next}
        aria-label="Siguiente"
      >
        ›
      </button>
    </section>
  );
};

export default CarrouselOfertas;
