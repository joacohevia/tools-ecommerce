import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hace scroll al top de la página cada vez que cambia la ruta.
 * Se monta una sola vez en App.jsx y reacciona a cambios de pathname.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
