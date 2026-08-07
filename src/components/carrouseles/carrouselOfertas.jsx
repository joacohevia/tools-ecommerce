import { useEffect, useState } from "react";
import { getProductos } from "../../http";
import Card from "../card";

const CarrouselOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductos({ destacado: true })
      .then(setOfertas)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;
  if (error || !ofertas.length) return null;

  return (
    <section id="seccion-ofertas" className="py-section-padding bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-headline-lg text-on-surface">Ofertas Especiales</h2>
            <p className="font-body text-body-md text-on-surface-variant mt-2">Productos destacados con los mejores precios</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => { const el = document.getElementById('carousel-ofertas'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
              className="btn-secondary w-10 h-10 rounded-full p-0"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => { const el = document.getElementById('carousel-ofertas'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
              className="btn-secondary w-10 h-10 rounded-full p-0"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div id="carousel-ofertas" className="flex overflow-x-auto gap-gutter hide-scrollbar snap-x snap-mandatory pb-2">
          {ofertas.map((p) => (
            <div key={p.id} className="snap-start flex-shrink-0">
              <Card producto={p} onDelete={(id) => setOfertas((prev) => prev.filter((x) => x.id !== id))} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarrouselOfertas;
