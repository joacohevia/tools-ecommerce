import useEmblaCarousel from "embla-carousel-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const CarouselContext = createContext(null);

/**
 * @param {object}        props
 * @param {import("embla-carousel").EmblaOptionsType} [props.opts]
 * @param {import("embla-carousel").EmblaPluginType[]} [props.plugins]
 * @param {(api: import("embla-carousel").EmblaCarouselType) => void} [props.setApi]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
function Carousel({ opts, plugins, orientation = "horizontal", setApi, className, children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((emblaApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- embla requiere sincronizar estado inicial
    onSelect(api);
    api.on("reInit", onSelect).on("select", onSelect);
  }, [api, onSelect]);

  useEffect(() => {
    if (setApi) setApi(api);
  }, [api, setApi]);

  const contextValue = {
    carouselRef,
    api,
    opts,
    orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
    scrollPrev: () => api?.scrollPrev(),
    scrollNext: () => api?.scrollNext(),
    canScrollPrev,
    canScrollNext,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("useCarousel debe usarse dentro de <Carousel />");
  return context;
}

function CarouselContent({ className, ...props }) {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn("flex", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function CarouselPrevious({ className, ...props }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      className={cn(
        "absolute z-10 rounded-full border border-white/10 text-white p-2 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default",
        "bg-dark-blue hover:bg-gray-700",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2"
          : "top-2 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Anterior"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon="inline-start">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

function CarouselNext({ className, ...props }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      className={cn(
        "absolute z-10 rounded-full border border-white/10 text-white p-2 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default",
        "bg-dark-blue hover:bg-gray-700",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2"
          : "bottom-2 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Siguiente"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon="inline-end">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious };
