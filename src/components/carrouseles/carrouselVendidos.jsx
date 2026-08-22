import { useEffect, useState } from "react";
import { getProductos } from "../../http";
import Card from "../card";

const CarrouselVendidos = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductos({ mas_vendido: true })
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;
  if (error || !productos.length) return null;

  return (
    <section className="py-3 bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-3">
          <h2 className="font-headline text-headline-lg text-on-surface">Más Vendidos</h2>
          <p className="font-body text-body-md text-on-surface-variant mt-1">Los favoritos de nuestros clientes</p>
        </div>
        <div className="relative">
          <button
            onClick={() => { const el = document.getElementById('carousel-vendidos'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
            className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-container/90 backdrop-blur border border-outline-variant text-on-surface shadow-md transition-all duration-200 hover:bg-primary hover:text-on-primary hover:scale-110"
            aria-label="Anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div id="carousel-vendidos" className="flex overflow-x-auto gap-gutter hide-scrollbar snap-x snap-mandatory pb-2">
            {productos.map((p) => (
              <div key={p.id} className="snap-start flex-shrink-0">
                <Card producto={p} onDelete={(id) => setProductos((prev) => prev.filter((x) => x.id !== id))} />
              </div>
            ))}
          </div>
          <button
            onClick={() => { const el = document.getElementById('carousel-vendidos'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-container/90 backdrop-blur border border-outline-variant text-on-surface shadow-md transition-all duration-200 hover:bg-primary hover:text-on-primary hover:scale-110"
            aria-label="Siguiente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CarrouselVendidos;
