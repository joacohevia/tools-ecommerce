import { useEffect, useState } from 'react';

/**
 * Botón flotante visible solo en desktop que aparece al hacer scroll
 * y lleva al usuario al inicio de la página con animación suave.
 *
 * @returns {JSX.Element}
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`hidden md:flex fixed bottom-6 left-24 z-50 rounded-full w-12 h-12 items-center justify-center shadow-lg transition-all duration-300 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary cursor-pointer ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Volver al inicio"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
