import CarrouselOfert from '../carrouseles/carrouselOfertas';
import CarrouselVendidos from '../carrouseles/carrouselVendidos';
import SeccionHerramientas from '../secciones/seccionHerramientas';
import SeccionNov from '../secciones/seccionNov';
import Portada from './portada';

const Home = () => {
  return (
    <>
      <Portada />
      <CarrouselVendidos />
      <SeccionHerramientas />
      <CarrouselOfert />
      <SeccionNov />
    </>
  );
};

export default Home;
