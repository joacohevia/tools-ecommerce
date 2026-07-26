import { useEffect, useState } from "react";
import Card from "../card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { getProductos } from "../../http";

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
    <section className="my-8">
      <h2 className="text-2xl font-semibold mb-4 font-title">
        Más Vendidos
      </h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 3,
        }}
        className="px-10"
      >
        <CarouselContent className="gap-2 py-1">
          {productos.map((p) => (
            <CarouselItem key={p.id}>
              <Card producto={p} onDelete={(id) => setProductos((prev) => prev.filter((x) => x.id !== id))} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default CarrouselVendidos;
