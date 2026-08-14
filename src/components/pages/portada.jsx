import { Link } from 'react-router-dom';
import heroImg from '../../../public/herramientas-fondo.jpg';

const Portada = () => {
  const handleVerOfertas = () => {
    const ofertas = document.getElementById('seccion-ofertas');
    if (!ofertas) return;
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight : 0;
    const y = ofertas.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section className="relative h-[530px] md:h-[600px] bg-surface-container-low overflow-hidden mt-0">
      <img
        src={heroImg}
        alt="Herramientas Tandil"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <p className="font-label-bold uppercase tracking-wider text-primary mb-3">
          Herramientas de Calidad
        </p>
        <h1 className="font-headline text-headline-xl text-on-surface my-5 mb-4 max-w-3xl">
          Todo lo que necesitás para tu taller y hogar
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant max-w-xl mb-8">
          Más de 10 años brindando las mejores herramientas en Tandil. Calidad, precio y atención personalizada.
        </p>
        <div className="flex gap-4">
          <Link to="/productos" className="btn-primary rounded px-8 py-3 no-underline">
            Comprar Herramientas
          </Link>
          <button onClick={handleVerOfertas} className="btn-secondary rounded px-8 py-3 no-underline">
            Ver Ofertas
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portada;
